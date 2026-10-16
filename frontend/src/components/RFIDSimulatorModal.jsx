import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Radio, Send, CheckCircle2, Cpu, Sparkles, X } from 'lucide-react';

/**
 * RFIDSimulatorModal Component
 * Styled in Cream (#F5EFEB), Mauve (#6E3B61), and Crisp White.
 */
export default function RFIDSimulatorModal({ isOpen, onClose, preselectedTag }) {
  const { students, logs, triggerScan, isScanning } = useAttendance();
  const [customTag, setCustomTag] = useState(preselectedTag || '');
  const [activeTappedTag, setActiveTappedTag] = useState(null);

  if (!isOpen) return null;

  const attendedRolls = new Set(logs.map((l) => l.student?.rollNo));

  const handleCardTap = async (tagId) => {
    setActiveTappedTag(tagId);
    await triggerScan(tagId);
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
              <h3 className="text-lg font-extrabold text-[#2A1726] flex items-center space-x-2">
                <span>Interactive RFID Badge Scanner</span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-[#D1B8CC] text-[#2A1726] border border-[#BA87AD] font-bold shadow-2xs">
                  RC522 / PN532 Emulator
                </span>
              </h3>
              <p className="text-xs text-[#5F4257] font-semibold">
                Click any student keycard or enter a custom tag to broadcast an RFID tap event
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
          
          {/* Manual Tag Entry & Tester */}
          <div className="p-4 rounded-xl bg-[#EDE0EB] border border-[#D1B8CC] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="text-xs text-[#2A1726] space-y-0.5">
              <div className="font-extrabold text-[#2A1726] flex items-center space-x-1.5">
                <Cpu className="h-4 w-4 text-[#6E3B61]" />
                <span>Direct Tag Dispatcher</span>
              </div>
              <p className="text-[#5F4257] font-medium">
                Test custom RFID IDs (e.g. try an unregistered card like <code className="text-rose-700 font-bold bg-white px-1.5 py-0.5 rounded border border-rose-300">UNKNOWN-999</code> to test 404 response)
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
                Registered Student RFID Keycards ({students.length})
              </h4>
              <span className="text-[11px] text-[#5F4257] font-semibold">
                Click "Scan Card" to tap badge onto reader
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => {
                const isAlreadyPresent = attendedRolls.has(student.rollNo);
                const isCurrentlyTapped = activeTappedTag === student.rfidTagId;

                return (
                  <div
                    key={student.id}
                    className={`relative rounded-2xl p-4 border-2 transition-all duration-300 ${
                      isCurrentlyTapped
                        ? 'border-[#6E3B61] bg-[#F3E6F0] shadow-xl shadow-[#6E3B61]/25 scale-[1.02]'
                        : isAlreadyPresent
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-[#D1B8CC] bg-gradient-to-br from-white via-[#FAF5F8] to-[#F3E6F0] hover:border-[#6E3B61] hover:shadow-md shadow-2xs'
                    }`}
                  >
                    {/* RFID Contactless Graphic */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-8 rounded rfid-chip border border-[#BA87AD] relative overflow-hidden">
                          <div className="absolute inset-0 border-t border-b border-[#6E3B61]/40 top-2"></div>
                          <div className="absolute inset-0 border-l border-r border-[#6E3B61]/40 left-3"></div>
                        </div>
                        <Radio className={`h-4 w-4 ${isCurrentlyTapped ? 'text-[#6E3B61] animate-ping' : 'text-[#8E587F]'}`} />
                      </div>

                      {/* Today's check-in status badge */}
                      {isAlreadyPresent ? (
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
                        onClick={() => handleCardTap(student.rfidTagId)}
                        disabled={isScanning}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isAlreadyPresent
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 shadow-2xs'
                            : 'btn-mauve-primary active:scale-95'
                        }`}
                        title={isAlreadyPresent ? 'Will reject with 409 Duplicate' : 'Transmit 13.56MHz RFID tap'}
                      >
                        <Radio className="h-3.5 w-3.5" />
                        <span>{isAlreadyPresent ? 'Retap (409)' : 'Scan Card'}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Hardware Protocol Information Box */}
          <div className="p-4 rounded-xl bg-[#F3E6F0] border border-[#D1B8CC] text-xs text-[#2A1726] flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-[#6E3B61] shrink-0 mt-0.5" />
            <div>
              <p className="text-[#2A1726] font-bold">Laboratory Verification Guide:</p>
              <ul className="list-disc list-inside space-y-1 mt-1 text-[11px] font-medium text-[#5F4257]">
                <li><strong className="text-[#2A1726]">New Scan:</strong> Tapping an unverified student records attendance with status <code>PRESENT</code> (or <code>LATE</code> after 09:30 AM).</li>
                <li><strong className="text-[#2A1726]">Duplicate Check:</strong> Tapping the same student twice on the same day is rejected by the backend with HTTP <code>409 Conflict</code>.</li>
                <li><strong className="text-[#2A1726]">Unregistered Card:</strong> Transmitting an unknown tag (e.g. <code>UNKNOWN-001</code>) returns HTTP <code>404 Not Found</code>.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Modal Footer - Solid Mauve Close Button */}
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
