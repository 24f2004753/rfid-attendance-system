import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { History, CheckCircle2, ClockAlert, Activity } from 'lucide-react';

/**
 * AttendanceFeed Component
 * Styled in Cream, Mauve, and White.
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
            <Activity className="h-5 w-5 text-mauve-600 animate-pulse" />
            <h2 className="text-xl font-bold text-mauve-950 tracking-tight">Today's Live Attendance Feed</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-mauve-100 text-mauve-800 border border-mauve-200 font-mono font-medium">
              {logs.length} Scans Today
            </span>
          </div>
          <p className="text-xs text-mauve-700/80 mt-0.5">
            Real-time verification log updated automatically via 13.56MHz RFID scans
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-cream-100 p-1 rounded-xl border border-cream-300 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'ALL' ? 'bg-mauve-600 text-white font-semibold shadow-xs' : 'text-mauve-700 hover:text-mauve-950'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setStatusFilter('PRESENT')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'PRESENT' ? 'bg-mauve-600 text-white font-semibold shadow-xs' : 'text-mauve-700 hover:text-mauve-950'
              }`}
            >
              On-Time ({logs.filter((l) => l.status === 'PRESENT').length})
            </button>
            <button
              onClick={() => setStatusFilter('LATE')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'LATE' ? 'bg-mauve-600 text-white font-semibold shadow-xs' : 'text-mauve-700 hover:text-mauve-950'
              }`}
            >
              Late ({logs.filter((l) => l.status === 'LATE').length})
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="overflow-x-auto rounded-xl border border-cream-300 bg-white">
        <table className="w-full text-left text-xs text-mauve-900">
          <thead className="bg-cream-100 text-[11px] uppercase tracking-wider text-mauve-700 font-semibold border-b border-cream-300">
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
                <td colSpan="5" className="py-12 text-center text-mauve-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 border-2 border-mauve-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking live session records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-mauve-500">
                  <div className="max-w-sm mx-auto text-center space-y-2">
                    <History className="h-8 w-8 text-mauve-400 mx-auto" />
                    <p className="text-mauve-900 font-semibold">No Check-Ins Found Today</p>
                    <p className="text-xs text-mauve-600">
                      Simulate a hardware card tap or run the Python simulator to register immediate attendance.
                    </p>
                    <button
                      onClick={onOpenSimulator}
                      className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-mauve-100 text-mauve-800 border border-mauve-200 hover:bg-mauve-200 transition-all inline-block shadow-xs"
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
                      isMostRecent ? 'bg-mauve-50/50 hover:bg-mauve-50/70' : 'hover:bg-cream-50/80'
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-mauve-900 font-semibold">
                          {formatTime(record.timestamp)}
                        </span>
                        <span className="text-[10px] text-mauve-500 font-mono">
                          {formatDate(record.timestamp)}
                        </span>
                        {isMostRecent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-mauve-200 text-mauve-800 border border-mauve-300 uppercase">
                            Latest
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-7 w-7 rounded-full bg-mauve-100 text-mauve-800 font-bold flex items-center justify-center text-xs border border-mauve-200">
                          {record.student?.name?.charAt(0) || 'S'}
                        </div>
                        <span className="font-semibold text-mauve-950">
                          {record.student?.name || 'Unknown Student'}
                        </span>
                      </div>
                    </td>

                    {/* Roll No */}
                    <td className="py-3 px-4 font-mono text-mauve-800">
                      {record.student?.rollNo || '—'}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-mauve-700">
                      {record.student?.department || '—'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          isPresent
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isPresent ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <ClockAlert className="h-3.5 w-3.5 text-amber-600" />
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
