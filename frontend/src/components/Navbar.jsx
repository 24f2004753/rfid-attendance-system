import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Radio, RefreshCw, Cpu } from 'lucide-react';

export default function Navbar({ onOpenSimulator }) {
  const { autoRefresh, setAutoRefresh, refreshAllData, loading } = useAttendance();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-mauve-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Lab Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-mauve-700 to-mauve-900 flex items-center justify-center shadow-md shadow-mauve-800/25 text-white">
              <Radio className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-mauve-950">SmartLab RFID</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-mauve-100 text-mauve-900 border border-mauve-300 shadow-2xs">
                  Simulation-Ready v1.0
                </span>
              </div>
              <p className="text-xs text-mauve-700 font-medium">Autonomous Student Attendance System</p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Live Polling Switch */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                autoRefresh
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs'
                  : 'bg-mauve-100 hover:bg-mauve-200 border-mauve-300 text-mauve-900'
              }`}
              title="Toggle 3s live polling for hardware scans"
            >
              <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-emerald-600 animate-ping' : 'bg-mauve-400'}`}></span>
              <span>{autoRefresh ? 'Live Feed (3s)' : 'Feed Paused'}</span>
            </button>

            {/* Manual Refresh Button - Mauve tinted, not white */}
            <button
              onClick={refreshAllData}
              disabled={loading}
              className="p-2 rounded-xl bg-mauve-100 hover:bg-mauve-200 border border-mauve-300 text-mauve-800 hover:text-mauve-950 transition-colors shadow-2xs"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-mauve-700' : ''}`} />
            </button>

            {/* Launch Hardware Emulator CTA */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-mauve-700 to-mauve-800 hover:from-mauve-800 hover:to-mauve-900 text-white shadow-md shadow-mauve-800/25 transition-all transform active:scale-95"
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
