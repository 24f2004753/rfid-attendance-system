import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AttendanceContext = createContext();

const API_BASE = 'http://localhost:8080/api';

/**
 * AttendanceProvider fulfills Expt 3 (LO2):
 * State management using React Hooks (useState, useEffect, useCallback) and Context API.
 * Encapsulates all REST API interactions, error management, and live polling.
 */
export const AttendanceProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    totalPresentToday: 0,
    attendancePercentage: 0.0,
    onTimeCount: 0,
    lateCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // Helper to show dynamic auto-dismissing toast notifications
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current && current.id === id ? null : current));
    }, duration);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // 1. Fetch Students
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      if (!res.ok) throw new Error(`Failed to fetch students (${res.status})`);
      const data = await res.json();
      setStudents(data);
      return data;
    } catch (err) {
      console.error('fetchStudents error:', err);
      setError(err.message);
      return [];
    }
  }, []);

  // 2. Fetch Today's Attendance Logs
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance/today`);
      if (!res.ok) throw new Error(`Failed to fetch logs (${res.status})`);
      const data = await res.json();
      setLogs(data);
      return data;
    } catch (err) {
      console.error('fetchLogs error:', err);
      return [];
    }
  }, []);

  // 3. Fetch Dashboard Metrics
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance/stats`);
      if (!res.ok) throw new Error(`Failed to fetch stats (${res.status})`);
      const data = await res.json();
      setStats(data);
      return data;
    } catch (err) {
      console.error('fetchStats error:', err);
      return null;
    }
  }, []);

  // Combined Initial & Refresh Data Fetch
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStudents(), fetchLogs(), fetchStats()]);
    setLoading(false);
  }, [fetchStudents, fetchLogs, fetchStats]);

  // Initial mount load
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Live Polling effect: Every 3 seconds if autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
      fetchStats();
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs, fetchStats]);

  // 4. Action: Add Student (POST /api/students)
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

  // 5. Action: Delete Student (DELETE /api/students/:id)
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

  // 6. Action: Trigger RFID Card Scan (POST /api/attendance/scan)
  const triggerScan = async (rfidTagId) => {
    setIsScanning(true);
    try {
      const res = await fetch(`${API_BASE}/attendance/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfidTagId }),
      });

      if (res.status === 201) {
        const record = await res.json();
        const studentName = record.student?.name || 'Student';
        const statusType = record.status === 'LATE' ? 'warning' : 'success';
        const statusLabel = record.status === 'LATE' ? 'Late Check-In' : 'Present (On-Time)';

        showToast(`[RFID SCAN SUCCESS] ${studentName} marked ${statusLabel}`, statusType, 5000);
        await Promise.all([fetchLogs(), fetchStats()]);
        return { success: true, record };
      } else if (res.status === 409) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.message || 'Duplicate Scan: Student has already checked in today.';
        showToast(`[DUPLICATE REJECTED] ${msg}`, 'warning', 4500);
        return { success: false, error: msg, code: 409 };
      } else if (res.status === 404) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.message || `Unknown RFID Tag '${rfidTagId}': Not enrolled in system.`;
        showToast(`[ACCESS DENIED] ${msg}`, 'error', 4500);
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
        students,
        logs,
        stats,
        loading,
        error,
        toast,
        autoRefresh,
        isScanning,
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

