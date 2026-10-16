import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Radio, RefreshCw, Cpu, LogOut, ShieldCheck, UserCheck, Layers } from 'lucide-react';

export default function Navbar({ onOpenSimulator }) {
  const {
    currentUser,
    logout,
    selectedBranchFilter,
    setSelectedBranchFilter,
    autoRefresh,
    setAutoRefresh,
    refreshAllData,
    loading
  } = useAttendance();

  const isHOD = currentUser?.role === 'HOD';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D6BED1] bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Lab Title */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-[#6E3B61] flex items-center justify-center shadow-md shadow-[#6E3B61]/30 text-white">
              <Radio className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight text-[#2A1726]">SmartLab RFID</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#F3E6F0] text-[#4A1E3F] border border-[#D1B8CC]">
                  Simulation-Ready
                </span>
              </div>
              <p className="text-xs text-[#5F4257] font-semibold">Autonomous Student Attendance System</p>
            </div>
          </div>

          {/* Center: HOD Cross-Branch Filter Switcher */}
          {isHOD ? (
            <div className="hidden md:flex items-center space-x-2 bg-[#EDE0EB] px-3 py-1.5 rounded-xl border border-[#D1B8CC] shadow-2xs">
              <Layers className="h-4 w-4 text-[#6E3B61]" />
              <span className="text-xs font-bold text-[#2A1726]">Branch Oversight:</span>
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="text-xs font-bold bg-white text-[#4A1E3F] px-2.5 py-1 rounded-lg border border-[#D1B8CC] focus:outline-none focus:border-[#6E3B61] cursor-pointer"
              >
                <option value="ALL">All Branches (Universal View)</option>
                <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                <option value="Computer Science & Engineering">Computer Science & Eng (CE)</option>
                <option value="Information Technology">Information Technology (IT)</option>
                <option value="Electronics & Comm Engineering">Electronics & Comm (EC)</option>
              </select>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2 bg-[#F3E6F0] px-3 py-1.5 rounded-xl border border-[#D1B8CC]">
              <span className="h-2 w-2 rounded-full bg-[#6E3B61]"></span>
              <span className="text-xs font-bold text-[#4A1E3F]">
                Authorized Scope: {currentUser?.department}
              </span>
            </div>
          )}

          {/* Right Action Controls & User Profile */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Live Polling Switch */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                autoRefresh
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-950 shadow-xs'
                  : 'btn-mauve-tint shadow-xs'
              }`}
              title="Toggle 3s live polling for hardware scans"
            >
              <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-emerald-600 animate-ping' : 'bg-[#8E587F]'}`}></span>
              <span>{autoRefresh ? 'Live (3s)' : 'Paused'}</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={refreshAllData}
              disabled={loading}
              className="p-2 rounded-xl btn-mauve-tint shadow-xs cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#6E3B61]' : 'text-[#4A1E3F]'}`} />
            </button>

            {/* Launch Hardware Emulator CTA */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs btn-mauve-primary cursor-pointer active:scale-95"
            >
              <Cpu className="h-4 w-4" />
              <span>RFID Scanner</span>
            </button>

            {/* User Profile Pill & Logout */}
            <div className="flex items-center space-x-2 pl-2 border-l border-[#D6BED1]">
              <div className="text-right hidden lg:block">
                <div className="text-xs font-extrabold text-[#2A1726] truncate max-w-[150px]">
                  {currentUser?.name || 'Faculty User'}
                </div>
                <div className="text-[10px] font-bold text-[#6E3B61] flex items-center justify-end space-x-1">
                  {isHOD ? <ShieldCheck className="h-3 w-3 text-amber-600" /> : <UserCheck className="h-3 w-3 text-[#6E3B61]" />}
                  <span>{currentUser?.role === 'HOD' ? 'HOD Super-Admin' : currentUser?.department}</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl btn-mauve-tint hover:bg-rose-100 hover:text-rose-700 transition-colors shadow-xs cursor-pointer"
                title="Logout of Faculty Account"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
