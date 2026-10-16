import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { History, CheckCircle2, ClockAlert, Activity } from 'lucide-react';

/**
 * AttendanceFeed Component
 * Styled in Cream (#F5EFEB), Mauve (#6E3B61), and Crisp White.
 */
export default function AttendanceFeed({ onOpenSimulator }) {
  const { logs, loading } = useAttendance();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        log.student?.name?.toLowerCase().includes(term) ||
        log.student?.rollNo?.toLowerCase().includes(term) ||
        log.student?.department?.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [logs, statusFilter, searchQuery]);

  const formatTime = (ts) => {
    if (!ts) return '—';
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts;
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    try {
      const date = new Date(ts);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#D6BED1] shadow-sm">
      
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-[#6E3B61] animate-pulse" />
            <h2 className="text-xl font-extrabold text-[#2A1726] tracking-tight">Today's Live Attendance Feed</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3E6F0] text-[#4A1E3F] border border-[#D1B8CC] font-mono font-bold shadow-2xs">
              {logs.length} Scans Today
            </span>
          </div>
          <p className="text-xs text-[#5F4257] mt-0.5 font-medium">
            Real-time verification log updated automatically via 13.56MHz RFID scans
          </p>
        </div>

        {/* Filter Pills - Mauve container with solid non-white pill buttons */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-[#EDE0EB] p-1.5 rounded-xl border border-[#D1B8CC] shadow-2xs text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'tab-btn-active' : 'tab-btn-inactive'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setStatusFilter('PRESENT')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'PRESENT' ? 'tab-btn-active' : 'tab-btn-inactive'
              }`}
            >
              On-Time ({logs.filter((l) => l.status === 'PRESENT').length})
            </button>
            <button
              onClick={() => setStatusFilter('LATE')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'LATE' ? 'tab-btn-active' : 'tab-btn-inactive'
              }`}
            >
              Late ({logs.filter((l) => l.status === 'LATE').length})
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="overflow-x-auto rounded-xl border border-[#D6BED1] bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-[#2A1726]">
          <thead className="table-header-mauve text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Verification Time</th>
              <th className="py-3.5 px-4">Student Name</th>
              <th className="py-3.5 px-4">Roll Number</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE2D8] font-medium">
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-[#5F4257]">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 border-2 border-[#6E3B61] border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking live session records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-[#5F4257]">
                  <div className="max-w-sm mx-auto text-center space-y-2">
                    <History className="h-8 w-8 text-[#8E587F] mx-auto" />
                    <p className="text-[#2A1726] font-bold text-sm">No Check-Ins Found Today</p>
                    <p className="text-xs text-[#5F4257]">
                      Simulate a hardware card tap or run the Python simulator to register immediate attendance.
                    </p>
                    {/* Non-white button */}
                    <button
                      onClick={onOpenSimulator}
                      className="mt-3 px-5 py-2.5 rounded-xl text-xs btn-mauve-primary transition-all inline-block cursor-pointer active:scale-95"
                    >
                      Tap Student Badge
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((record, index) => {
                const isPresent = record.status === 'PRESENT';
                const isMostRecent = index === 0;

                return (
                  <tr
                    key={record.id}
                    className={`transition-colors ${
                      isMostRecent ? 'bg-[#F3E6F0]/60 hover:bg-[#F3E6F0]/80' : 'hover:bg-[#FAF2F7]'
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[#2A1726] font-bold">
                          {formatTime(record.timestamp)}
                        </span>
                        <span className="text-[10px] text-[#5F4257] font-mono">
                          {formatDate(record.timestamp)}
                        </span>
                        {isMostRecent && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#D1B8CC] text-[#2A1726] border border-[#8E587F]/30 uppercase shadow-2xs">
                            Latest
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-7 w-7 rounded-full bg-[#6E3B61] text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                          {record.student?.name?.charAt(0) || 'S'}
                        </div>
                        <span className="font-bold text-[#2A1726]">
                          {record.student?.name || 'Unknown Student'}
                        </span>
                      </div>
                    </td>

                    {/* Roll No */}
                    <td className="py-3 px-4 font-mono font-bold text-[#2A1726]">
                      {record.student?.rollNo || '—'}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-[#5F4257] font-medium">
                      {record.student?.department || '—'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isPresent
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            : 'bg-amber-100 text-amber-950 border border-amber-300'
                        }`}
                      >
                        {isPresent ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                        ) : (
                          <ClockAlert className="h-3.5 w-3.5 text-amber-700" />
                        )}
                        <span>{isPresent ? 'PRESENT' : 'LATE'}</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
