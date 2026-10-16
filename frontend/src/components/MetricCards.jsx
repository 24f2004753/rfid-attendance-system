import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Users, UserCheck, TrendingUp, ClockAlert, CheckCircle2 } from 'lucide-react';

export default function MetricCards() {
  const { stats, loading } = useAttendance();

  const percentage = stats.attendancePercentage || 0;
  const isHealthy = percentage >= 75;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Total Enrolled */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Enrolled</p>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            {loading ? '—' : stats.totalEnrolled}
          </h3>
          <span className="text-xs text-slate-400">Active Students</span>
        </div>
        <div className="mt-3 text-xs text-slate-500 flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
          <span>Registered in H2 database</span>
        </div>
      </div>

      {/* 2. Present Today */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Present Today</p>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            {loading ? '—' : stats.totalPresentToday}
          </h3>
          <span className="text-xs text-slate-400">Verified Badges</span>
        </div>
        <div className="mt-3 text-xs text-emerald-400 flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Unique scans for current date</span>
        </div>
      </div>

      {/* 3. Attendance Percentage */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Attendance Rate</p>
          <div className={`p-2 rounded-xl border ${isHealthy ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            {loading ? '—' : `${percentage}%`}
          </h3>
          <span className={`text-xs font-medium ${isHealthy ? 'text-cyan-400' : 'text-amber-400'}`}>
            {percentage >= 75 ? 'Target Met (≥75%)' : 'Below Target'}
          </span>
        </div>
        {/* Dynamic Progress Bar */}
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              isHealthy ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          ></div>
        </div>
      </div>

      {/* 4. Punctuality Analysis */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Punctuality</p>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ClockAlert className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-xl font-bold text-white">{stats.onTimeCount || 0}</span>
            <span className="text-xs text-slate-400">On-Time</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5">
            <ClockAlert className="h-4 w-4 text-amber-400" />
            <span className="text-xl font-bold text-amber-300">{stats.lateCount || 0}</span>
            <span className="text-xs text-amber-400/80">Late</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
          <span>Threshold: 09:30 AM</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 font-mono text-slate-400">Auto-Classified</span>
        </div>
      </div>

    </div>
  );
}

