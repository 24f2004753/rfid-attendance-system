import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AttendanceContext = createContext();

const API_BASE = 'http://localhost:8080/api';

// Fallback faculty directory for instant offline or client-side authentication
const FALLBACK_FACULTY = {
  me_faculty: {
    username: 'me_faculty',
    name: 'Prof. Vikram Malhotra',
    role: 'FACULTY',
    department: 'Mechanical Engineering',
    email: 'vikram.me@university.edu',
  },
  ce_faculty: {
    username: 'ce_faculty',
    name: 'Prof. Sunita Rao',
    role: 'FACULTY',
    department: 'Computer Science & Engineering',
    email: 'sunita.ce@university.edu',
  },
  hod: {
    username: 'hod',
    name: 'Dr. A. V. Raman (HOD)',
    role: 'HOD',
    department: 'ALL',
    email: 'hod.engineering@university.edu',
  },
};

/**
 * AttendanceProvider fulfills Expt 3 (State Management & Context API)
 * with integrated Role-Based Faculty Authorization (ME, CE, HOD).
 */
export const AttendanceProvider = ({ children }) => {
  // 1. Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smartlab_rfid_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Department filter (HOD can toggle; faculty locked to their department)
  const [selectedBranchFilter, setSelectedBranchFilter] = useState(() => {
    return currentUser?.department || 'ALL';
  });

  useEffect(() => {
    if (currentUser) {
      setSelectedBranchFilter(currentUser.department || 'ALL');
    }
  }, [currentUser]);

  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    totalPresentToday: 0,
    attendancePercentage: 0.0,
    onTimeCount: 0,
    lateCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // Helper for toast notifications
  const showToast = useCallback((message, type = 'info', duration = 4500) => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current && current.id === id ? null : current));
    }, duration);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Login handler
  const login = async (username, password) => {
    try {
      // 1. Try backend authentication endpoint
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        localStorage.setItem('smartlab_rfid_user', JSON.stringify(user));
        showToast(`Welcome, ${user.name}! Authenticated as ${user.role} (${user.department})`, 'success');
        return { success: true, user };
      }
    } catch (e) {
      console.warn('Backend auth unreachable, checking local fallback credentials:', e);
    }

    // 2. Client-side fallback if backend is momentarily restarting
    const cleanUser = username?.toLowerCase().trim();
    if (FALLBACK_FACULTY[cleanUser]) {
      const user = FALLBACK_FACULTY[cleanUser];
      setCurrentUser(user);
      localStorage.setItem('smartlab_rfid_user', JSON.stringify(user));
      showToast(`Welcome, ${user.name}! Signed in as ${user.role} (${user.department})`, 'success');
      return { success: true, user };
    }

    return { success: false, error: 'Invalid faculty username or credentials' };
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('smartlab_rfid_user');
    showToast('Signed out of faculty portal', 'info');
  };

  // 2. Fetch Students (with optional branch filter)
  const fetchStudents = useCallback(async (deptOverride) => {
    try {
      const dept = deptOverride !== undefined ? deptOverride : selectedBranchFilter;
      const url = dept && dept !== 'ALL'
        ? `${API_BASE}/students?department=${encodeURIComponent(dept)}`
        : `${API_BASE}/students`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch students (${res.status})`);
      const data = await res.json();
      setStudents(data);
      return data;
    } catch (err) {
      console.error('fetchStudents error:', err);
      return [];
    }
  }, [selectedBranchFilter]);

  // 3. Fetch Today's Attendance Logs (with optional branch filter)
  const fetchLogs = useCallback(async (deptOverride) => {
    try {
      const dept = deptOverride !== undefined ? deptOverride : selectedBranchFilter;
      const url = dept && dept !== 'ALL'
        ? `${API_BASE}/attendance/today?department=${encodeURIComponent(dept)}`
        : `${API_BASE}/attendance/today`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch logs (${res.status})`);
      const data = await res.json();
      setLogs(data);
      return data;
    } catch (err) {
      console.error('fetchLogs error:', err);
      return [];
    }
  }, [selectedBranchFilter]);

  // 4. Fetch Dashboard Metrics
  const fetchStats = useCallback(async (deptOverride) => {
    try {
      const dept = deptOverride !== undefined ? deptOverride : selectedBranchFilter;
      const url = dept && dept !== 'ALL'
        ? `${API_BASE}/attendance/stats?department=${encodeURIComponent(dept)}`
        : `${API_BASE}/attendance/stats`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch stats (${res.status})`);
      const data = await res.json();
      setStats(data);
      return data;
    } catch (err) {
      console.error('fetchStats error:', err);
      return null;
    }
  }, [selectedBranchFilter]);

  // Combined Refresh Data
  const refreshAllData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    await Promise.all([fetchStudents(), fetchLogs(), fetchStats()]);
    setLoading(false);
  }, [currentUser, fetchStudents, fetchLogs, fetchStats]);

  // Reload data on user login or branch filter change
  useEffect(() => {
    if (currentUser) {
      refreshAllData();
    }
  }, [currentUser, selectedBranchFilter, refreshAllData]);

  // Live Polling effect: Every 3 seconds if autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh || !currentUser) return;
    const interval = setInterval(() => {
      fetchLogs();
      fetchStats();
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, currentUser, fetchLogs, fetchStats]);

  // 5. Action: Add Student (POST /api/students)
  const addStudent = async (studentData) => {
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        const errorMsg = errorBody.message || `Error ${res.status}: Failed to register student`;
        throw new Error(errorMsg);
      }

      const created = await res.json();
      setStudents((prev) => [...prev, created]);
      await fetchStats();
      showToast(`Student ${created.name} (${created.rollNo}) registered successfully!`, 'success');
      return { success: true, student: created };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // 6. Action: Delete Student (DELETE /api/students/:id)
  const deleteStudent = async (id, studentName = 'Student') => {
    try {
      const res = await fetch(`${API_BASE}/students/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(`Failed to delete student (Status: ${res.status})`);
      }

      setStudents((prev) => prev.filter((s) => s.id !== id));
      await Promise.all([fetchLogs(), fetchStats()]);
      showToast(`Deleted ${studentName} from registry.`, 'info');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // 7. Action: Trigger RFID Card Scan (With Role-Based Department Enforcement!)
  const triggerScan = async (rfidTagId) => {
    setIsScanning(true);
    try {
      const payload = {
        rfidTagId,
        facultyRole: currentUser?.role || 'HOD',
        facultyDepartment: currentUser?.department || 'ALL',
      };

      const res = await fetch(`${API_BASE}/attendance/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Faculty-Role': currentUser?.role || 'HOD',
          'X-Faculty-Department': currentUser?.department || 'ALL',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        const record = await res.json();
        const studentName = record.student?.name || 'Student';
        const statusType = record.status === 'LATE' ? 'warning' : 'success';
        const statusLabel = record.status === 'LATE' ? 'Late Check-In' : 'Present (On-Time)';

        showToast(`[RFID SCAN SUCCESS] ${studentName} marked ${statusLabel}`, statusType, 5000);
        await Promise.all([fetchLogs(), fetchStats()]);
        return { success: true, record };
      } else if (res.status === 403) {
        // Access Denied: Department restriction violated!
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.message || `${currentUser?.department} Faculty is not authorized to mark attendance for this branch student.`;
        showToast(`[ACCESS DENIED - 403] ${msg}`, 'error', 6000);
        return { success: false, error: msg, code: 403 };
      } else if (res.status === 409) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.message || 'Duplicate Scan: Student has already checked in today.';
        showToast(`[DUPLICATE REJECTED] ${msg}`, 'warning', 4500);
        return { success: false, error: msg, code: 409 };
      } else if (res.status === 404) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.message || `Unknown RFID Tag '${rfidTagId}': Not enrolled in system.`;
        showToast(`[ACCESS DENIED - 404] ${msg}`, 'error', 4500);
        return { success: false, error: msg, code: 404 };
      } else {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.message || `Scan failed with HTTP status ${res.status}`;
        showToast(msg, 'error', 4500);
        return { success: false, error: msg, code: res.status };
      }
    } catch (err) {
      console.error('triggerScan error:', err);
      showToast(`Network Error: Ensure backend is running at ${API_BASE}`, 'error', 5000);
      return { success: false, error: err.message };
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        currentUser,
        selectedBranchFilter,
        setSelectedBranchFilter,
        students,
        logs,
        stats,
        loading,
        error,
        toast,
        autoRefresh,
        isScanning,
        login,
        logout,
        setAutoRefresh,
        refreshAllData,
        fetchStudents,
        fetchLogs,
        fetchStats,
        addStudent,
        deleteStudent,
        triggerScan,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
