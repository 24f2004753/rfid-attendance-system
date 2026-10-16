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
      <div className="bg-white rounded-2xl p-5 border-t-4 border-t-[#6E3B61] border-x border-b border-[#D6BED1] shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5F4257]">Total Enrolled</p>
          <div className="p-2.5 rounded-xl bg-[#F3E6F0] text-[#6E3B61] border border-[#D1B8CC] shadow-2xs">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-3xl font-extrabold text-[#2A1726] tracking-tight">
            {loading ? '—' : stats.totalEnrolled}
          </h3>
          <span className="text-xs text-[#5F4257] font-semibold">Active Students</span>
        </div>
        <div className="mt-3 text-xs text-[#5F4257] flex items-center space-x-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-[#6E3B61]"></span>
          <span>Registered in database</span>
        </div>
      </div>

      {/* 2. Present Today */}
      <div className="bg-white rounded-2xl p-5 border-t-4 border-t-[#8E587F] border-x border-b border-[#D6BED1] shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5F4257]">Present Today</p>
          <div className="p-2.5 rounded-xl bg-[#F3E6F0] text-[#6E3B61] border border-[#D1B8CC] shadow-2xs">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-3xl font-extrabold text-[#2A1726] tracking-tight">
            {loading ? '—' : stats.totalPresentToday}
          </h3>
          <span className="text-xs text-[#5F4257] font-semibold">Verified Badges</span>
        </div>
        <div className="mt-3 text-xs text-emerald-800 font-bold flex items-center space-x-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>Unique scans today</span>
        </div>
      </div>

      {/* 3. Attendance Percentage */}
      <div className="bg-white rounded-2xl p-5 border-t-4 border-t-[#542548] border-x border-b border-[#D6BED1] shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5F4257]">Attendance Rate</p>
          <div className="p-2.5 rounded-xl bg-[#F3E6F0] text-[#6E3B61] border border-[#D1B8CC] shadow-2xs">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-3xl font-extrabold text-[#2A1726] tracking-tight">
            {loading ? '—' : `${percentage}%`}
          </h3>
          <span className={`text-xs font-bold ${isHealthy ? 'text-[#6E3B61]' : 'text-amber-800'}`}>
            {percentage >= 75 ? 'Target Met (≥75%)' : 'Below Target'}
          </span>
        </div>
        {/* Dynamic Progress Bar */}
        <div className="mt-3 w-full bg-[#F5EFEB] rounded-full h-2.5 overflow-hidden border border-[#D6BED1]">
          <div
            className="h-full transition-all duration-700 rounded-full bg-gradient-to-r from-[#8E587F] to-[#6E3B61]"
            style={{ width: `${Math.min(100, percentage)}%` }}
          ></div>
        </div>
      </div>

      {/* 4. Punctuality Analysis */}
      <div className="bg-white rounded-2xl p-5 border-t-4 border-t-[#3A1431] border-x border-b border-[#D6BED1] shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5F4257]">Punctuality</p>
          <div className="p-2.5 rounded-xl bg-[#F3E6F0] text-[#6E3B61] border border-[#D1B8CC] shadow-2xs">
            <ClockAlert className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span className="text-xl font-extrabold text-[#2A1726]">{stats.onTimeCount || 0}</span>
            <span className="text-xs text-[#5F4257] font-semibold">On-Time</span>
          </div>
          <span className="text-[#D6BED1]">|</span>
          <div className="flex items-center space-x-1.5">
            <ClockAlert className="h-4 w-4 text-amber-700" />
            <span className="text-xl font-extrabold text-amber-950">{stats.lateCount || 0}</span>
            <span className="text-xs text-amber-800 font-semibold">Late</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-[#5F4257] flex items-center justify-between font-medium">
          <span>Threshold: 09:30 AM</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#F3E6F0] border border-[#D1B8CC] font-mono text-[#4A1E3F] font-bold">
            Auto-Classified
          </span>
        </div>
      </div>

    </div>
  );
}
