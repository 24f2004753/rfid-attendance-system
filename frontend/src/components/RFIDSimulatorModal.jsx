import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Radio, Send, CheckCircle2, Cpu, Sparkles, X, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

/**
 * RFIDSimulatorModal Component
 * Implements Role-Based Department Restrictions:
 * - HOD: Can mark anyone present across all branches.
 * - ME Faculty: Can ONLY mark Mechanical Engineering students.
 * - CE Faculty: Can ONLY mark Computer Engineering students.
 */
export default function RFIDSimulatorModal({ isOpen, onClose, preselectedTag }) {
  const { students, logs, triggerScan, isScanning, currentUser, showToast } = useAttendance();
  const [customTag, setCustomTag] = useState(preselectedTag || '');
  const [activeTappedTag, setActiveTappedTag] = useState(null);

  if (!isOpen) return null;

  const attendedRolls = new Set(logs.map((l) => l.student?.rollNo));
  const isHOD = currentUser?.role === 'HOD';

  // Department Authorization Check for physical/simulated card tap
  const isStudentAuthorizedForUser = (student) => {
    if (isHOD) return true;
    const dept = student.department?.toLowerCase() || '';
    const userDept = currentUser?.department?.toLowerCase() || '';

    if (userDept.includes('mechanical') && dept.includes('mechanical')) {
      return true;
    }
    if ((userDept.includes('computer') || userDept.includes('ce')) &&
        (dept.includes('computer') || dept.includes('ce') || dept.includes('cse'))) {
      return true;
    }
    return false;
  };

  const handleCardTap = async (student) => {
    if (!isStudentAuthorizedForUser(student)) {
      showToast(
        `[ACCESS DENIED - 403] As ${currentUser?.department} Faculty, you are not authorized to mark attendance for ${student.name} (${student.department}).`,
        'error',
        6000
      );
      return;
    }

    setActiveTappedTag(student.rfidTagId);
    await triggerScan(student.rfidTagId);
    setTimeout(() => {
      setActiveTappedTag(null);
    }, 1200);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!customTag.trim()) return;
    await triggerScan(customTag.trim().toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl border-2 border-[#D1B8CC] shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D1B8CC] bg-[#EDE0EB]">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-[#6E3B61] text-white flex items-center justify-center shadow-md shadow-[#6E3B61]/30">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-[#2A1726]">Interactive RFID Badge Scanner</h3>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-[#D1B8CC] text-[#2A1726] border border-[#BA87AD] font-bold shadow-2xs">
                  {isHOD ? 'HOD Global Scope' : `${currentUser?.department} Only`}
                </span>
              </div>
              <p className="text-xs text-[#5F4257] font-semibold">
                {isHOD
                  ? 'Dr. Raman (HOD) is authorized to tap & mark attendance for any student across all branches.'
                  : `Signed in as ${currentUser?.name}. You can only scan badges for ${currentUser?.department} students.`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#4A1E3F] hover:text-[#2A1726] bg-[#D1B8CC]/60 hover:bg-[#D1B8CC] border border-[#BA87AD] transition-colors shadow-2xs cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Faculty Scope Alert Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
            isHOD
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-[#F3E6F0] border-[#D1B8CC] text-[#4A1E3F]'
          }`}>
            <div className="flex items-center space-x-2">
              {isHOD ? <ShieldCheck className="h-4 w-4 text-amber-700" /> : <Lock className="h-4 w-4 text-[#6E3B61]" />}
              <span>
                {isHOD
                  ? 'University HOD Authority Active: All student badges are unlocked for scanning.'
                  : `Department Lock Active: Only ${currentUser?.department} keycards are authorized for tap.`}
              </span>
            </div>
            <span className="text-[11px] underline">
              {isHOD ? 'Full Access' : 'Department Restricted'}
            </span>
          </div>

          {/* Manual Tag Entry & Tester */}
          <div className="p-4 rounded-xl bg-[#EDE0EB] border border-[#D1B8CC] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="text-xs text-[#2A1726] space-y-0.5">
              <div className="font-extrabold text-[#2A1726] flex items-center space-x-1.5">
                <Cpu className="h-4 w-4 text-[#6E3B61]" />
                <span>Direct Tag Dispatcher</span>
              </div>
              <p className="text-[#5F4257] font-medium">
                Test custom RFID IDs (e.g. try an unregistered card like <code className="text-rose-700 font-bold bg-white px-1.5 py-0.5 rounded border border-rose-300">UNKNOWN-999</code> or a cross-branch card)
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value.toUpperCase())}
                placeholder="Enter Tag ID (e.g. TAG-A101)"
                className="px-3.5 py-2 text-xs font-mono rounded-xl bg-white border border-[#D1B8CC] text-[#2A1726] placeholder-[#8E587F] focus:outline-none focus:border-[#6E3B61] focus:ring-1 focus:ring-[#6E3B61] w-full sm:w-56 shadow-2xs font-bold"
              />
              <button
                type="submit"
                disabled={isScanning || !customTag.trim()}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs btn-mauve-primary disabled:opacity-50 transition-all shrink-0 active:scale-95 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Transmit</span>
              </button>
            </form>
          </div>

          {/* Enrolled Student Smart Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5F4257]">
                Student RFID Keycards ({students.length})
              </h4>
              <span className="text-[11px] text-[#5F4257] font-semibold">
                {isHOD ? 'All cards active' : `Click to tap (${currentUser?.department} only)`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => {
                const isAlreadyPresent = attendedRolls.has(student.rollNo);
                const isCurrentlyTapped = activeTappedTag === student.rfidTagId;
                const isAuthorized = isStudentAuthorizedForUser(student);

                return (
                  <div
                    key={student.id}
                    className={`relative rounded-2xl p-4 border-2 transition-all duration-300 ${
                      !isAuthorized
                        ? 'opacity-60 border-slate-300 bg-slate-50'
                        : isCurrentlyTapped
                        ? 'border-[#6E3B61] bg-[#F3E6F0] shadow-xl shadow-[#6E3B61]/25 scale-[1.02]'
                        : isAlreadyPresent
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-[#D1B8CC] bg-gradient-to-br from-white via-[#FAF5F8] to-[#F3E6F0] hover:border-[#6E3B61] hover:shadow-md shadow-2xs'
                    }`}
                  >
                    {/* RFID Contactless Graphic & Authorization Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-8 rounded rfid-chip border border-[#BA87AD] relative overflow-hidden">
                          <div className="absolute inset-0 border-t border-b border-[#6E3B61]/40 top-2"></div>
                          <div className="absolute inset-0 border-l border-r border-[#6E3B61]/40 left-3"></div>
                        </div>
                        <Radio className={`h-4 w-4 ${isCurrentlyTapped ? 'text-[#6E3B61] animate-ping' : 'text-[#8E587F]'}`} />
                      </div>

                      {/* Today's check-in status or Locked Badge */}
                      {!isAuthorized ? (
                        <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                          <Lock className="h-3 w-3 text-slate-500" />
                          <span>Locked</span>
                        </span>
                      ) : isAlreadyPresent ? (
                        <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                          <span>Checked In</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F3E6F0] text-[#4A1E3F] border border-[#D1B8CC]">
                          Pending Tap
                        </span>
                      )}
                    </div>

                    {/* Student Identity Information */}
                    <div className="mt-4">
                      <div className="text-sm font-extrabold text-[#2A1726] truncate">{student.name}</div>
                      <div className="flex items-center justify-between text-[11px] text-[#5F4257] mt-1 font-semibold">
                        <span className="font-mono text-[#2A1726]">{student.rollNo}</span>
                        <span className="truncate max-w-[140px] text-[#5F4257]">{student.department}</span>
                      </div>
                    </div>

                    {/* RFID Tag ID Code & Tap Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-[#D1B8CC] flex items-center justify-between">
                      <div className="font-mono text-xs font-bold text-[#4A1E3F]">
                        {student.rfidTagId}
                      </div>

                      <button
                        onClick={() => handleCardTap(student)}
                        disabled={isScanning}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          !isAuthorized
                            ? 'bg-slate-200 text-slate-500 border border-slate-300 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300'
                            : isAlreadyPresent
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 shadow-2xs'
                            : 'btn-mauve-primary active:scale-95'
                        }`}
                        title={
                          !isAuthorized
                            ? `Unauthorized: ${currentUser?.department} faculty cannot mark ${student.department} students`
                            : isAlreadyPresent
                            ? 'Will reject with 409 Duplicate'
                            : 'Transmit 13.56MHz RFID tap'
                        }
                      >
                        {!isAuthorized ? (
                          <>
                            <Lock className="h-3 w-3" />
                            <span>Locked</span>
                          </>
                        ) : (
                          <>
                            <Radio className="h-3.5 w-3.5" />
                            <span>{isAlreadyPresent ? 'Retap (409)' : 'Scan Card'}</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Department RBAC Notice */}
          <div className="p-4 rounded-xl bg-[#F3E6F0] border border-[#D1B8CC] text-xs text-[#2A1726] flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-[#6E3B61] shrink-0 mt-0.5" />
            <div>
              <p className="text-[#2A1726] font-bold">Role-Based Access Enforcement Rules:</p>
              <ul className="list-disc list-inside space-y-1 mt-1 text-[11px] font-medium text-[#5F4257]">
                <li><strong className="text-[#2A1726]">ME Faculty:</strong> Authorized to mark Mechanical Engineering students only. Cross-branch scans return HTTP <code>403 Forbidden</code>.</li>
                <li><strong className="text-[#2A1726]">CE Faculty:</strong> Authorized to mark Computer Engineering students only. Cross-branch scans return HTTP <code>403 Forbidden</code>.</li>
                <li><strong className="text-[#2A1726]">HOD Login:</strong> Universal authority to mark attendance and inspect live feeds across all branches.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#D1B8CC] bg-[#EDE0EB] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs btn-mauve-primary cursor-pointer active:scale-95"
          >
            Close Simulator
          </button>
        </div>

      </div>
    </div>
  );
}
