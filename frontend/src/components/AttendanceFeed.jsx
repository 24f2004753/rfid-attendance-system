import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { History, CheckCircle2, ClockAlert, Activity } from 'lucide-react';

/**
 * AttendanceFeed Component
 * Styled in Cream, Mauve (~30%), and White.
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
    <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-sm">
      
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-mauve-700 animate-pulse" />
            <h2 className="text-xl font-bold text-mauve-950 tracking-tight">Today's Live Attendance Feed</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-mauve-100 text-mauve-900 border border-mauve-300 font-mono font-bold shadow-2xs">
              {logs.length} Scans Today
            </span>
          </div>
          <p className="text-xs text-mauve-700 mt-0.5 font-medium">
            Real-time verification log updated automatically via 13.56MHz RFID scans
          </p>
        </div>

        {/* Filter Pills - Mauve container with solid non-white pill buttons */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-mauve-100 p-1.5 rounded-xl border border-mauve-200 shadow-2xs text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg transition-all font-semibold ${
                statusFilter === 'ALL'
                  ? 'bg-mauve-700 text-white shadow-sm'
                  : 'text-mauve-800 hover:bg-mauve-200/70'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setStatusFilter('PRESENT')}
              className={`px-3.5 py-1.5 rounded-lg transition-all font-semibold ${
                statusFilter === 'PRESENT'
                  ? 'bg-mauve-700 text-white shadow-sm'
                  : 'text-mauve-800 hover:bg-mauve-200/70'
              }`}
            >
              On-Time ({logs.filter((l) => l.status === 'PRESENT').length})
            </button>
            <button
              onClick={() => setStatusFilter('LATE')}
              className={`px-3.5 py-1.5 rounded-lg transition-all font-semibold ${
                statusFilter === 'LATE'
                  ? 'bg-mauve-700 text-white shadow-sm'
                  : 'text-mauve-800 hover:bg-mauve-200/70'
              }`}
            >
              Late ({logs.filter((l) => l.status === 'LATE').length})
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="overflow-x-auto rounded-xl border border-mauve-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-mauve-950">
          <thead className="bg-mauve-100/90 text-[11px] uppercase tracking-wider text-mauve-950 font-bold border-b border-mauve-200">
            <tr>
              <th className="py-3 px-4">Verification Time</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Roll Number</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200 font-medium">
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-mauve-600">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 border-2 border-mauve-700 border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking live session records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-mauve-600">
                  <div className="max-w-sm mx-auto text-center space-y-2">
                    <History className="h-8 w-8 text-mauve-400 mx-auto" />
                    <p className="text-mauve-950 font-bold text-sm">No Check-Ins Found Today</p>
                    <p className="text-xs text-mauve-700">
                      Simulate a hardware card tap or run the Python simulator to register immediate attendance.
                    </p>
                    {/* Non-white button */}
                    <button
                      onClick={onOpenSimulator}
                      className="mt-3 px-5 py-2.5 rounded-xl text-xs font-bold bg-mauve-700 hover:bg-mauve-800 text-white shadow-md shadow-mauve-700/25 transition-all inline-block active:scale-95"
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
                      isMostRecent ? 'bg-mauve-100/40 hover:bg-mauve-100/60' : 'hover:bg-cream-50/80'
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-mauve-950 font-bold">
                          {formatTime(record.timestamp)}
                        </span>
                        <span className="text-[10px] text-mauve-600 font-mono">
                          {formatDate(record.timestamp)}
                        </span>
                        {isMostRecent && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-mauve-200 text-mauve-900 border border-mauve-300 uppercase shadow-2xs">
                            Latest
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-7 w-7 rounded-full bg-mauve-100 text-mauve-900 font-bold flex items-center justify-center text-xs border border-mauve-300 shadow-2xs">
                          {record.student?.name?.charAt(0) || 'S'}
                        </div>
                        <span className="font-bold text-mauve-950">
                          {record.student?.name || 'Unknown Student'}
                        </span>
                      </div>
                    </td>

                    {/* Roll No */}
                    <td className="py-3 px-4 font-mono font-medium text-mauve-900">
                      {record.student?.rollNo || '—'}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-mauve-800 font-medium">
                      {record.student?.department || '—'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          isPresent
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
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
