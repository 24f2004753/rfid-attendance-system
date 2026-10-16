import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { UserPlus, Search, Trash2, IdCard, Check, AlertCircle, Sparkles } from 'lucide-react';

/**
 * StudentManagement Component
 * Strictly implements requirements for:
 * - Expt 2 (LO2): Component hierarchy, JSX styling, dynamic table rendering
 * - Expt 3 (LO2): State management with useState/useEffect and Form Handling with Real-Time Validation
 */
export default function StudentManagement({ onSelectCardForSimulation }) {
  const { students, addStudent, deleteStudent, loading } = useAttendance();

  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal visibility for Add Student Form
  const [showAddModal, setShowAddModal] = useState(false);

  // Form input state (Expt 3 - Controlled Form Elements)
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    rfidTagId: '',
    department: 'Computer Science & Engineering',
  });

  // Touched state to prevent displaying errors before user interaction
  const [touched, setTouched] = useState({
    name: false,
    rollNo: false,
    rfidTagId: false,
    department: false,
  });

  // Real-time Form Validation (Expt 3 - Dynamic Form Validation)
  const validationErrors = useMemo(() => {
    const errors = {};

    // 1. Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters long';
    }

    // 2. Roll No validation
    const trimmedRoll = formData.rollNo.trim().toUpperCase();
    if (!trimmedRoll) {
      errors.rollNo = 'Roll number is required';
    } else if (students.some((s) => s.rollNo?.toUpperCase() === trimmedRoll)) {
      errors.rollNo = 'This roll number is already registered';
    }

    // 3. RFID Tag ID validation
    const trimmedTag = formData.rfidTagId.trim().toUpperCase();
    if (!trimmedTag) {
      errors.rfidTagId = 'RFID Tag ID is required';
    } else if (trimmedTag.length < 4) {
      errors.rfidTagId = 'Tag ID must be at least 4 characters (e.g. TAG-F606)';
    } else if (students.some((s) => s.rfidTagId?.toUpperCase() === trimmedTag)) {
      errors.rfidTagId = 'This RFID Tag ID is already assigned to another student';
    }

    // 4. Department validation
    if (!formData.department.trim()) {
      errors.department = 'Department selection is required';
    }

    return errors;
  }, [formData, students]);

  const isFormValid = Object.keys(validationErrors).length === 0;

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Generate a random sample RFID tag helper
  const handleAutoGenerateTag = () => {
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    const tag = `TAG-${randomHex}`;
    setFormData((prev) => ({ ...prev, rfidTagId: tag }));
    setTouched((prev) => ({ ...prev, rfidTagId: true }));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const payload = {
      name: formData.name.trim(),
      rollNo: formData.rollNo.trim().toUpperCase(),
      rfidTagId: formData.rfidTagId.trim().toUpperCase(),
      department: formData.department.trim(),
    };

    const res = await addStudent(payload);
    if (res.success) {
      // Reset form
      setFormData({
        name: '',
        rollNo: '',
        rfidTagId: '',
        department: 'Computer Science & Engineering',
      });
      setTouched({
        name: false,
        rollNo: false,
        rfidTagId: false,
        department: false,
      });
      setShowAddModal(false);
    }
  };

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return students;
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) ||
        s.rollNo?.toLowerCase().includes(term) ||
        s.rfidTagId?.toLowerCase().includes(term) ||
        s.department?.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      
      {/* Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Student Directory</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono font-medium">
              {filteredStudents.length} / {students.length} Enrolled
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage enrolled students, assign hardware RFID badges, and verify identities
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, roll no, tag..."
              className="pl-9 pr-4 py-2 w-52 sm:w-64 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Add Student Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Roll Number</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">RFID Tag ID</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading student registry from backend...</span>
                  </div>
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500">
                  No students found matching your query.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-900/50 transition-colors">
                  
                  {/* Name + Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{student.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: #{student.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Roll Number */}
                  <td className="py-3 px-4 font-mono font-medium text-slate-200">
                    <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">
                      {student.rollNo}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4 text-slate-400">
                    {student.department}
                  </td>

                  {/* RFID Tag Badge */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onSelectCardForSimulation && onSelectCardForSimulation(student.rfidTagId)}
                      className="group flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 font-mono hover:bg-cyan-900/50 hover:border-cyan-500 transition-all"
                      title="Click to simulate tap in Badge Scanner"
                    >
                      <IdCard className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span>{student.rfidTagId}</span>
                    </button>
                  </td>

                  {/* Actions (Delete) */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete student "${student.name}"?`)) {
                          deleteStudent(student.id, student.name);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Form Modal (Expt 3 Compliance) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 border border-slate-700/80 shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Enroll New Student</h3>
                <p className="text-xs text-slate-400">Expt 3: Controlled inputs with real-time validation</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Student Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g. Maya Sharma"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border ${
                      touched.name && validationErrors.name
                        ? 'border-rose-500/80 focus:ring-rose-500'
                        : touched.name && !validationErrors.name
                        ? 'border-emerald-500/80 focus:ring-emerald-500'
                        : 'border-slate-800 focus:border-cyan-500'
                    } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all`}
                  />
                  {touched.name && (
                    <div className="absolute right-3 top-2.5">
                      {validationErrors.name ? (
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Check className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                  )}
                </div>
                {touched.name && validationErrors.name && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center space-x-1">
                    <span>{validationErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Roll Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                    onBlur={() => handleBlur('rollNo')}
                    placeholder="e.g. CS2024-055"
                    className={`w-full px-3.5 py-2.5 font-mono uppercase rounded-xl text-xs bg-slate-900 border ${
                      touched.rollNo && validationErrors.rollNo
                        ? 'border-rose-500/80 focus:ring-rose-500'
                        : touched.rollNo && !validationErrors.rollNo
                        ? 'border-emerald-500/80 focus:ring-emerald-500'
                        : 'border-slate-800 focus:border-cyan-500'
                    } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all`}
                  />
                  {touched.rollNo && (
                    <div className="absolute right-3 top-2.5">
                      {validationErrors.rollNo ? (
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Check className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                  )}
                </div>
                {touched.rollNo && validationErrors.rollNo && (
                  <p className="mt-1 text-[11px] text-rose-400">
                    {validationErrors.rollNo}
                  </p>
                )}
              </div>

              {/* RFID Tag ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Hardware RFID Tag ID <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateTag}
                    className="flex items-center space-x-1 text-[10px] text-cyan-400 hover:text-cyan-300"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Auto-Generate Hex</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="rfidTagId"
                    value={formData.rfidTagId}
                    onChange={handleChange}
                    onBlur={() => handleBlur('rfidTagId')}
                    placeholder="e.g. TAG-F606"
                    className={`w-full px-3.5 py-2.5 font-mono uppercase rounded-xl text-xs bg-slate-900 border ${
                      touched.rfidTagId && validationErrors.rfidTagId
                        ? 'border-rose-500/80 focus:ring-rose-500'
                        : touched.rfidTagId && !validationErrors.rfidTagId
                        ? 'border-emerald-500/80 focus:ring-emerald-500'
                        : 'border-slate-800 focus:border-cyan-500'
                    } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all`}
                  />
                  {touched.rfidTagId && (
                    <div className="absolute right-3 top-2.5">
                      {validationErrors.rfidTagId ? (
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Check className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                  )}
                </div>
                {touched.rfidTagId && validationErrors.rfidTagId && (
                  <p className="mt-1 text-[11px] text-rose-400">
                    {validationErrors.rfidTagId}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department <span className="text-rose-400">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Comm Engineering">Electronics & Comm Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                  <option value="Biotechnology">Biotechnology</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isFormValid
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Register Student
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

