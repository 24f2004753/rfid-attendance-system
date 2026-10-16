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
      <div className="bg-white rounded-2xl p-5 border-t-4 border-t-mauve-600 border-x border-b border-cream-300 hover:border-mauve-400 hover:shadow-md shadow-xs transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-mauve-800">Total Enrolled</p>
          <div className="p-2.5 rounded-xl bg-mauve-100 text-mauve-800 border border-mauve-200 shadow-2xs">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-3xl font-extrabold text-mauve-950 tracking-tight">
            {loading ? '—' : stats.totalEnrolled}
          </h3>
          <span className="text-xs text-mauve-600 font-medium">Active Students</span>
        </div>
        <div className="mt-3 text-xs text-mauve-700 flex items-center space-x-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-mauve-600"></span>
          <span>Registered in database</span>
        </div>
      </div>

      {/* 2. Present Today */}
      <div className="bg-white rounded-2xl p-5 border-t-4 border-t-mauve-700 border-x border-b border-cream-300 hover:border-mauve-400 hover:shadow-md shadow-xs transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-mauve-800">Present Today</p>
          <div className="p-2.5 rounded-xl bg-mauve-100 text-mauve-800 border border-mauve-200 shadow-2xs">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-3xl font-extrabold text-mauve-950 tracking-tight">
            {loading ? '—' : stats.totalPresentToday}
          </h3>
          <span className="text-xs text-mauve-600 font-medium">Verified Badges</span>
        </div>
        <div className="mt-3 text-xs text-emerald-800 font-semibold flex items-center space-x-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>Unique scans today</span>
        </div>
      </div>

      {/* 3. Attendance Percentage */}
      <div className="bg-white rounded-2xl p-5 border-t-4 border-t-mauve-800 border-x border-b border-cream-300 hover:border-mauve-400 hover:shadow-md shadow-xs transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-mauve-800">Attendance Rate</p>
          <div className="p-2.5 rounded-xl bg-mauve-100 text-mauve-800 border border-mauve-200 shadow-2xs">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-3xl font-extrabold text-mauve-950 tracking-tight">
            {loading ? '—' : `${percentage}%`}
          </h3>
          <span className={`text-xs font-bold ${isHealthy ? 'text-mauve-800' : 'text-amber-800'}`}>
            {percentage >= 75 ? 'Target Met (≥75%)' : 'Below Target'}
          </span>
        </div>
        {/* Dynamic Progress Bar */}
        <div className="mt-3 w-full bg-cream-200 rounded-full h-2 overflow-hidden border border-cream-300">
          <div
            className="h-full transition-all duration-700 rounded-full bg-gradient-to-r from-mauve-500 to-mauve-700"
            style={{ width: `${Math.min(100, percentage)}%` }}
          ></div>
        </div>
      </div>

      {/* 4. Punctuality Analysis */}
      <div className="bg-white rounded-2xl p-5 border-t-4 border-t-mauve-900 border-x border-b border-cream-300 hover:border-mauve-400 hover:shadow-md shadow-xs transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-mauve-800">Punctuality</p>
          <div className="p-2.5 rounded-xl bg-mauve-100 text-mauve-800 border border-mauve-200 shadow-2xs">
            <ClockAlert className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span className="text-xl font-bold text-mauve-950">{stats.onTimeCount || 0}</span>
            <span className="text-xs text-mauve-700 font-medium">On-Time</span>
          </div>
          <span className="text-mauve-200">|</span>
          <div className="flex items-center space-x-1.5">
            <ClockAlert className="h-4 w-4 text-amber-700" />
            <span className="text-xl font-bold text-amber-950">{stats.lateCount || 0}</span>
            <span className="text-xs text-amber-800 font-medium">Late</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-mauve-700 flex items-center justify-between">
          <span className="font-medium">Threshold: 09:30 AM</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-mauve-100 border border-mauve-200 font-mono text-mauve-900 font-semibold">
            Auto-Classified
          </span>
        </div>
      </div>

    </div>
  );
}
