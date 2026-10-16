import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { UserPlus, Search, Trash2, IdCard, Check, AlertCircle, Sparkles, X } from 'lucide-react';

/**
 * StudentManagement Component
 * Styled in Cream (#F5EFEB), Mauve (#6E3B61), and Crisp White.
 */
export default function StudentManagement({ onSelectCardForSimulation }) {
  const { students, addStudent, deleteStudent, loading } = useAttendance();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    rfidTagId: '',
    department: 'Computer Science & Engineering',
  });

  const [touched, setTouched] = useState({
    name: false,
    rollNo: false,
    rfidTagId: false,
    department: false,
  });

  const validationErrors = useMemo(() => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters long';
    }

    const trimmedRoll = formData.rollNo.trim().toUpperCase();
    if (!trimmedRoll) {
      errors.rollNo = 'Roll number is required';
    } else if (students.some((s) => s.rollNo?.toUpperCase() === trimmedRoll)) {
      errors.rollNo = 'This roll number is already registered';
    }

    const trimmedTag = formData.rfidTagId.trim().toUpperCase();
    if (!trimmedTag) {
      errors.rfidTagId = 'RFID Tag ID is required';
    } else if (trimmedTag.length < 4) {
      errors.rfidTagId = 'Tag ID must be at least 4 characters (e.g. TAG-F606)';
    } else if (students.some((s) => s.rfidTagId?.toUpperCase() === trimmedTag)) {
      errors.rfidTagId = 'This RFID Tag ID is already assigned to another student';
    }

    if (!formData.department.trim()) {
      errors.department = 'Department selection is required';
    }

    return errors;
  }, [formData, students]);

  const isFormValid = Object.keys(validationErrors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleAutoGenerateTag = () => {
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    const tag = `TAG-${randomHex}`;
    setFormData((prev) => ({ ...prev, rfidTagId: tag }));
    setTouched((prev) => ({ ...prev, rfidTagId: true }));
  };

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
    <div className="bg-white rounded-2xl p-6 border border-[#D6BED1] shadow-sm">
      
      {/* Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-[#2A1726] tracking-tight">Student Directory</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3E6F0] text-[#4A1E3F] border border-[#D1B8CC] font-mono font-bold shadow-2xs">
              {filteredStudents.length} / {students.length} Enrolled
            </span>
          </div>
          <p className="text-xs text-[#5F4257] mt-0.5 font-medium">
            Manage enrolled students, assign hardware RFID badges, and verify identities
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8E587F]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, roll no, tag..."
              className="pl-9 pr-4 py-2 w-52 sm:w-64 text-xs bg-[#FAF5F8] border border-[#D1B8CC] rounded-xl text-[#2A1726] placeholder-[#8E587F] focus:outline-none focus:border-[#6E3B61] focus:ring-1 focus:ring-[#6E3B61] transition-all shadow-2xs font-medium"
            />
          </div>

          {/* Add Student Button (Explicit Solid Mauve Button) */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs btn-mauve-primary cursor-pointer active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-xl border border-[#D6BED1] bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-[#2A1726]">
          <thead className="table-header-mauve text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4">Roll Number</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">RFID Tag ID</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE2D8] font-medium">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-[#5F4257]">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 border-2 border-[#6E3B61] border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading student registry from backend...</span>
                  </div>
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-[#5F4257]">
                  No students found matching your query.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-[#FAF2F7] transition-colors">
                  
                  {/* Name + Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-[#6E3B61] text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[#2A1726]">{student.name}</div>
                        <div className="text-[10px] text-[#5F4257] font-mono">ID: #{student.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Roll Number */}
                  <td className="py-3 px-4 font-mono font-bold text-[#2A1726]">
                    <span className="px-2.5 py-1 rounded-md bg-[#F5EFEB] border border-[#D6BED1]">
                      {student.rollNo}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4 text-[#5F4257] font-medium">
                    {student.department}
                  </td>

                  {/* RFID Tag Badge (Pill button) */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onSelectCardForSimulation && onSelectCardForSimulation(student.rfidTagId)}
                      className="group flex items-center space-x-1.5 px-3 py-1.5 rounded-lg rfid-tag-pill transition-all cursor-pointer shadow-2xs"
                      title="Click to simulate tap in Badge Scanner"
                    >
                      <IdCard className="h-3.5 w-3.5 text-[#6E3B61] group-hover:scale-110 transition-transform" />
                      <span>{student.rfidTagId}</span>
                    </button>
                  </td>

                  {/* Actions (Delete button) */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete student "${student.name}"?`)) {
                          deleteStudent(student.id, student.name);
                        }
                      }}
                      className="p-1.5 rounded-lg btn-mauve-tint hover:bg-rose-100 hover:text-rose-700 transition-colors shadow-2xs cursor-pointer"
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

      {/* Add Student Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#D1B8CC] shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between p-6 border-b border-[#D1B8CC] bg-[#EDE0EB]">
              <div>
                <h3 className="text-lg font-extrabold text-[#2A1726]">Enroll New Student</h3>
                <p className="text-xs text-[#5F4257] font-semibold">Controlled inputs with real-time validation</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#4A1E3F] hover:text-[#2A1726] p-1.5 rounded-lg btn-mauve-tint transition-colors shadow-2xs cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#2A1726] mb-1">
                  Full Student Name <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g. Maya Sharma"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF5F8] border ${
                      touched.name && validationErrors.name
                        ? 'border-rose-400 focus:ring-rose-400'
                        : touched.name && !validationErrors.name
                        ? 'border-emerald-400 focus:ring-emerald-400'
                        : 'border-[#D1B8CC] focus:border-[#6E3B61]'
                    } text-[#2A1726] placeholder-[#8E587F] focus:outline-none focus:ring-1 transition-all font-medium`}
                  />
                  {touched.name && (
                    <div className="absolute right-3 top-2.5">
                      {validationErrors.name ? (
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                      ) : (
                        <Check className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                  )}
                </div>
                {touched.name && validationErrors.name && (
                  <p className="mt-1 text-[11px] text-rose-600 font-bold">
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-bold text-[#2A1726] mb-1">
                  Roll Number <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                    onBlur={() => handleBlur('rollNo')}
                    placeholder="e.g. CS2024-055"
                    className={`w-full px-3.5 py-2.5 font-mono uppercase rounded-xl text-xs bg-[#FAF5F8] border ${
                      touched.rollNo && validationErrors.rollNo
                        ? 'border-rose-400 focus:ring-rose-400'
                        : touched.rollNo && !validationErrors.rollNo
                        ? 'border-emerald-400 focus:ring-emerald-400'
                        : 'border-[#D1B8CC] focus:border-[#6E3B61]'
                    } text-[#2A1726] placeholder-[#8E587F] focus:outline-none focus:ring-1 transition-all font-bold`}
                  />
                  {touched.rollNo && (
                    <div className="absolute right-3 top-2.5">
                      {validationErrors.rollNo ? (
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                      ) : (
                        <Check className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                  )}
                </div>
                {touched.rollNo && validationErrors.rollNo && (
                  <p className="mt-1 text-[11px] text-rose-600 font-bold">
                    {validationErrors.rollNo}
                  </p>
                )}
              </div>

              {/* RFID Tag ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#2A1726]">
                    Hardware RFID Tag ID <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateTag}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg btn-mauve-tint text-[11px] font-bold cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 text-[#6E3B61]" />
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
                    className={`w-full px-3.5 py-2.5 font-mono uppercase rounded-xl text-xs bg-[#FAF5F8] border ${
                      touched.rfidTagId && validationErrors.rfidTagId
                        ? 'border-rose-400 focus:ring-rose-400'
                        : touched.rfidTagId && !validationErrors.rfidTagId
                        ? 'border-emerald-400 focus:ring-emerald-400'
                        : 'border-[#D1B8CC] focus:border-[#6E3B61]'
                    } text-[#2A1726] placeholder-[#8E587F] focus:outline-none focus:ring-1 transition-all font-bold`}
                  />
                  {touched.rfidTagId && (
                    <div className="absolute right-3 top-2.5">
                      {validationErrors.rfidTagId ? (
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                      ) : (
                        <Check className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                  )}
                </div>
                {touched.rfidTagId && validationErrors.rfidTagId && (
                  <p className="mt-1 text-[11px] text-rose-600 font-bold">
                    {validationErrors.rfidTagId}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-[#2A1726] mb-1">
                  Department <span className="text-rose-600">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF5F8] border border-[#D1B8CC] text-[#2A1726] focus:outline-none focus:border-[#6E3B61] transition-all font-semibold"
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
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#D1B8CC]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs btn-mauve-tint cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isFormValid
                      ? 'btn-mauve-primary active:scale-95'
                      : 'bg-[#EDE0EB] text-[#8E587F] cursor-not-allowed border border-[#D1B8CC]'
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
