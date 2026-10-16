import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Radio, RefreshCw, Cpu } from 'lucide-react';

export default function Navbar({ onOpenSimulator }) {
  const { autoRefresh, setAutoRefresh, refreshAllData, loading } = useAttendance();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D6BED1] bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Lab Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-[#6E3B61] flex items-center justify-center shadow-md shadow-[#6E3B61]/30 text-white">
              <Radio className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight text-[#2A1726]">SmartLab RFID</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#F3E6F0] text-[#4A1E3F] border border-[#D1B8CC]">
                  Simulation-Ready v1.0
                </span>
              </div>
              <p className="text-xs text-[#5F4257] font-semibold">Autonomous Student Attendance System</p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Live Polling Switch */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                autoRefresh
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-950 shadow-xs'
                  : 'btn-mauve-tint shadow-xs'
              }`}
              title="Toggle 3s live polling for hardware scans"
            >
              <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-emerald-600 animate-ping' : 'bg-[#8E587F]'}`}></span>
              <span>{autoRefresh ? 'Live Feed (3s)' : 'Feed Paused'}</span>
            </button>

            {/* Manual Refresh Button - Mauve tinted, not white */}
            <button
              onClick={refreshAllData}
              disabled={loading}
              className="p-2 rounded-xl btn-mauve-tint shadow-xs cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#6E3B61]' : 'text-[#4A1E3F]'}`} />
            </button>

            {/* Launch Hardware Emulator CTA - Prominent Mauve Button */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs btn-mauve-primary cursor-pointer active:scale-95"
            >
              <Cpu className="h-4 w-4" />
              <span>RFID Badge Scanner</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
