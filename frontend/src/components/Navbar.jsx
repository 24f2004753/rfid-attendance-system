import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Radio, RefreshCw, Cpu } from 'lucide-react';

export default function Navbar({ onOpenSimulator }) {
  const { autoRefresh, setAutoRefresh, refreshAllData, loading } = useAttendance();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cream-300 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Lab Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-mauve-600 to-mauve-800 flex items-center justify-center shadow-md shadow-mauve-600/20">
              <Radio className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-mauve-950">SmartLab RFID</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-mauve-100 text-mauve-800 border border-mauve-200">
                  Simulation-Ready v1.0
                </span>
              </div>
              <p className="text-xs text-mauve-700/80">Autonomous Student Attendance System</p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Live Polling Switch */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                autoRefresh
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-cream-300 text-mauve-700 hover:bg-cream-100'
              }`}
              title="Toggle 3s live polling for hardware scans"
            >
              <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-mauve-400'}`}></span>
              <span>{autoRefresh ? 'Live Feed (3s)' : 'Feed Paused'}</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={refreshAllData}
              disabled={loading}
              className="p-2 rounded-xl bg-white border border-cream-300 text-mauve-700 hover:text-mauve-950 hover:bg-cream-100 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-mauve-600' : ''}`} />
            </button>

            {/* Launch Hardware Emulator CTA */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-mauve-600 to-mauve-700 hover:from-mauve-700 hover:to-mauve-800 text-white shadow-md shadow-mauve-600/20 transition-all transform active:scale-95"
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
