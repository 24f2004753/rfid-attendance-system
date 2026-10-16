import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { History, CheckCircle2, ClockAlert, Filter, Calendar, Activity } from 'lucide-react';

/**
 * AttendanceFeed Component
 * Renders real-time verified attendance events for the current lab session.
 * Fulfills Expt 2 dynamic data rendering and Expt 6 backend REST data consumption.
 */
export default function AttendanceFeed({ onOpenSimulator }) {
  const { logs, loading } = useAttendance();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logs by status & search query
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

  // Format timestamp helper
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
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white tracking-tight">Today's Live Attendance Feed</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-mono font-medium">
              {logs.length} Scans Today
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time verification log updated automatically via 13.56MHz RFID scans
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'ALL' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setStatusFilter('PRESENT')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'PRESENT' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              On-Time ({logs.filter((l) => l.status === 'PRESENT').length})
            </button>
            <button
              onClick={() => setStatusFilter('LATE')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'LATE' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Late ({logs.filter((l) => l.status === 'LATE').length})
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Verification Time</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Roll Number</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking live session records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500">
                  <div className="max-w-sm mx-auto text-center space-y-2">
                    <History className="h-8 w-8 text-slate-600 mx-auto" />
                    <p className="text-slate-300 font-semibold">No Check-Ins Found Today</p>
                    <p className="text-xs text-slate-500">
                      Simulate a hardware card tap or run the Python simulator to register immediate attendance.
                    </p>
                    <button
                      onClick={onOpenSimulator}
                      className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all inline-block"
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
                      isMostRecent ? 'bg-cyan-950/20 hover:bg-cyan-950/30' : 'hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-cyan-300 font-semibold">
                          {formatTime(record.timestamp)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatDate(record.timestamp)}
                        </span>
                        {isMostRecent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 uppercase">
                            Latest
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-7 w-7 rounded-full bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-xs border border-slate-700">
                          {record.student?.name?.charAt(0) || 'S'}
                        </div>
                        <span className="font-semibold text-white">
                          {record.student?.name || 'Unknown Student'}
                        </span>
                      </div>
                    </td>

                    {/* Roll No */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {record.student?.rollNo || '—'}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-400">
                      {record.student?.department || '—'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          isPresent
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {isPresent ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <ClockAlert className="h-3.5 w-3.5 text-amber-400" />
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

