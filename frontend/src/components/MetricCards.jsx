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
      <div className="bg-white rounded-2xl p-5 border border-cream-300 hover:border-mauve-300 hover:shadow-md shadow-sm transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-mauve-700">Total Enrolled</p>
          <div className="p-2 rounded-xl bg-mauve-100 text-mauve-700 border border-mauve-200">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-3xl font-extrabold text-mauve-950 tracking-tight">
            {loading ? '—' : stats.totalEnrolled}
          </h3>
          <span className="text-xs text-mauve-600">Active Students</span>
        </div>
        <div className="mt-3 text-xs text-mauve-600/80 flex items-center space-x-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-mauve-500"></span>
          <span>Registered in H2 database</span>
        </div>
      </div>

      {/* 2. Present Today */}
      <div className="bg-white rounded-2xl p-5 border border-cream-300 hover:border-mauve-300 hover:shadow-md shadow-sm transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-mauve-700">Present Today</p>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-3xl font-extrabold text-mauve-950 tracking-tight">
            {loading ? '—' : stats.totalPresentToday}
          </h3>
          <span className="text-xs text-mauve-600">Verified Badges</span>
        </div>
        <div className="mt-3 text-xs text-emerald-700 font-medium flex items-center space-x-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Unique scans for current date</span>
        </div>
      </div>

      {/* 3. Attendance Percentage */}
      <div className="bg-white rounded-2xl p-5 border border-cream-300 hover:border-mauve-300 hover:shadow-md shadow-sm transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-mauve-700">Attendance Rate</p>
          <div className={`p-2 rounded-xl border ${isHealthy ? 'bg-mauve-100 text-mauve-700 border-mauve-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-3xl font-extrabold text-mauve-950 tracking-tight">
            {loading ? '—' : `${percentage}%`}
          </h3>
          <span className={`text-xs font-semibold ${isHealthy ? 'text-mauve-700' : 'text-amber-700'}`}>
            {percentage >= 75 ? 'Target Met (≥75%)' : 'Below Target'}
          </span>
        </div>
        {/* Dynamic Progress Bar */}
        <div className="mt-3 w-full bg-cream-200 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              isHealthy ? 'bg-gradient-to-r from-mauve-400 to-mauve-600' : 'bg-gradient-to-r from-amber-400 to-rose-400'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          ></div>
        </div>
      </div>

      {/* 4. Punctuality Analysis */}
      <div className="bg-white rounded-2xl p-5 border border-cream-300 hover:border-mauve-300 hover:shadow-md shadow-sm transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-mauve-700">Punctuality</p>
          <div className="p-2 rounded-xl bg-mauve-100 text-mauve-700 border border-mauve-200">
            <ClockAlert className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-xl font-bold text-mauve-950">{stats.onTimeCount || 0}</span>
            <span className="text-xs text-mauve-600">On-Time</span>
          </div>
          <span className="text-cream-300">|</span>
          <div className="flex items-center space-x-1.5">
            <ClockAlert className="h-4 w-4 text-amber-600" />
            <span className="text-xl font-bold text-amber-900">{stats.lateCount || 0}</span>
            <span className="text-xs text-amber-700">Late</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-mauve-600/80 flex items-center justify-between">
          <span>Threshold: 09:30 AM</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cream-100 border border-cream-300 font-mono text-mauve-800">Auto-Classified</span>
        </div>
      </div>

    </div>
  );
}
