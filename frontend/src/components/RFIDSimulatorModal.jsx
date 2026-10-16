import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Radio, Send, CheckCircle2, AlertTriangle, ShieldAlert, Cpu, Sparkles, X } from 'lucide-react';

/**
 * RFIDSimulatorModal Component
 * Interactive Hardware RFID Badge Simulator.
 * Allows university lab evaluators to test 13.56MHz RFID card taps directly from the UI.
 * Fires POST /api/attendance/scan payloads to the Spring Boot backend.
 */
export default function RFIDSimulatorModal({ isOpen, onClose, preselectedTag }) {
  const { students, logs, triggerScan, isScanning } = useAttendance();
  const [customTag, setCustomTag] = useState(preselectedTag || '');
  const [activeTappedTag, setActiveTappedTag] = useState(null);

  if (!isOpen) return null;

  // Set of roll numbers already marked today to show immediate visual status on badges
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col glass-card rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Interactive RFID Badge Scanner</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  RC522 / PN532 Emulator
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Click any student keycard or enter a custom tag to broadcast an RFID tap event
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Manual Tag Entry & Tester */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300 space-y-0.5">
              <div className="font-semibold text-white flex items-center space-x-1.5">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span>Direct Tag Dispatcher</span>
              </div>
              <p className="text-slate-400">
                Test custom RFID IDs (e.g. try an unregistered card like <code className="text-rose-400">UNKNOWN-999</code> to test 404 response)
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value.toUpperCase())}
                placeholder="Enter Tag ID (e.g. TAG-A101)"
                className="px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-56"
              />
              <button
                type="submit"
                disabled={isScanning || !customTag.trim()}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50 transition-all shrink-0 active:scale-95 shadow-md shadow-cyan-500/20"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Transmit</span>
              </button>
            </form>
          </div>

          {/* Enrolled Student Smart Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Registered Student RFID Keycards ({students.length})
              </h4>
              <span className="text-[11px] text-slate-500">
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
                    className={`relative rounded-2xl p-4 border transition-all duration-300 ${
                      isCurrentlyTapped
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                        : isAlreadyPresent
                        ? 'border-emerald-800/40 bg-slate-900/40 opacity-90'
                        : 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-slate-700'
                    }`}
                  >
                    {/* RFID Contactless Waves Graphic */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-8 rounded rfid-chip border border-amber-600/60 relative overflow-hidden">
                          <div className="absolute inset-0 border-t border-b border-amber-700/40 top-2"></div>
                          <div className="absolute inset-0 border-l border-r border-amber-700/40 left-3"></div>
                        </div>
                        <Radio className={`h-4 w-4 ${isCurrentlyTapped ? 'text-cyan-400 animate-ping' : 'text-slate-500'}`} />
                      </div>

                      {/* Today's check-in status badge */}
                      {isAlreadyPresent ? (
                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Checked In</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                          Pending Tap
                        </span>
                      )}
                    </div>

                    {/* Student Identity Information */}
                    <div className="mt-4">
                      <div className="text-sm font-bold text-white truncate">{student.name}</div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span className="font-mono">{student.rollNo}</span>
                        <span className="truncate max-w-[140px] text-slate-500">{student.department}</span>
                      </div>
                    </div>

                    {/* RFID Tag ID Code & Tap Action */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="font-mono text-xs font-semibold text-cyan-400">
                        {student.rfidTagId}
                      </div>

                      <button
                        onClick={() => handleCardTap(student.rfidTagId)}
                        disabled={isScanning}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isAlreadyPresent
                            ? 'bg-slate-800 hover:bg-amber-950/60 hover:text-amber-300 text-slate-400 border border-slate-700'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95'
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
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-200 font-semibold">Laboratory Verification Guide:</p>
              <ul className="list-disc list-inside space-y-1 mt-1 text-[11px]">
                <li><strong className="text-slate-300">New Scan:</strong> Tapping an unverified student records attendance with status <code>PRESENT</code> (or <code>LATE</code> after 09:30 AM).</li>
                <li><strong className="text-slate-300">Duplicate Check:</strong> Tapping the same student twice on the same day is rejected by the backend with HTTP <code>409 Conflict</code>.</li>
                <li><strong className="text-slate-300">Unregistered Card:</strong> Transmitting an unknown tag (e.g. <code>UNKNOWN-001</code>) returns HTTP <code>404 Not Found</code>.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Simulator
          </button>
        </div>

      </div>
    </div>
  );
}

