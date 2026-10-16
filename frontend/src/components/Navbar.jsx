import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Radio, RefreshCw, Cpu } from 'lucide-react';

export default function Navbar({ onOpenSimulator }) {
  const { autoRefresh, setAutoRefresh, refreshAllData, loading } = useAttendance();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Lab Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Radio className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">SmartLab RFID</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Simulation-Ready v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous Student Attendance System</p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Live Polling Switch */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                autoRefresh
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
              title="Toggle 3s live polling for hardware scans"
            >
              <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
              <span>{autoRefresh ? 'Live Feed (3s)' : 'Feed Paused'}</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={refreshAllData}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Launch Hardware Emulator CTA */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 transition-all transform active:scale-95"
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

