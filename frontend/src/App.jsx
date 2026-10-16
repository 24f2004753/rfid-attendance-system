import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import StudentManagement from './components/StudentManagement';
import AttendanceFeed from './components/AttendanceFeed';
import RFIDSimulatorModal from './components/RFIDSimulatorModal';
import { Radio, X, CheckCircle2, AlertTriangle, AlertCircle, Info, ExternalLink } from 'lucide-react';

function Dashboard() {
  const { toast, dismissToast } = useAttendance();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [selectedTagForSim, setSelectedTagForSim] = useState('');
  const [activeTab, setActiveTab] = useState('both'); // 'both', 'students', 'feed'

  const handleOpenSimulatorWithTag = (tag) => {
    setSelectedTagForSim(tag);
    setIsSimulatorOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-start space-x-3 backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400" />}
              {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400" />}
              {toast.type === 'info' && <Info className="h-5 w-5 text-cyan-400" />}
            </div>
            <div className="flex-1 text-xs">
              <p className="font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={dismissToast}
              className="text-slate-400 hover:text-white p-1 rounded-lg shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar onOpenSimulator={() => setIsSimulatorOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner with Course Lab Context */}
        <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                <span>Simulation-Ready University IoT Architecture</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                RFID-Based Student Attendance Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Integrated academic implementation covering REST APIs, React state management & hooks, Spring Boot backend, and Hibernate JPA persistence.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
              >
                <Radio className="h-4 w-4" />
                <span>Simulate RFID Tap</span>
              </button>
            </div>
          </div>
        </div>

        {/* Analytics & Metric Cards */}
        <MetricCards />

        {/* View Layout Filter Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'both' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side View
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'students' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Student Directory
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'feed' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Today's Live Feed
            </button>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 gap-8">
          {(activeTab === 'both' || activeTab === 'students') && (
            <StudentManagement onSelectCardForSimulation={handleOpenSimulatorWithTag} />
          )}

          {(activeTab === 'both' || activeTab === 'feed') && (
            <AttendanceFeed onOpenSimulator={() => setIsSimulatorOpen(true)} />
          )}
        </div>

      </main>

      {/* Hardware RFID Simulator Modal */}
      <RFIDSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        preselectedTag={selectedTagForSim}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p>SmartLab RFID Attendance System &bull; University Lab Course</p>
            <p className="text-[11px] text-slate-600">Built with Spring Boot 3, Spring Data JPA, H2 In-Memory DB, React 18, and Vite</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-cyan-400/80">Backend: http://localhost:8080</span>
            <span className="text-slate-700">|</span>
            <span className="font-mono text-emerald-400/80">H2 Console: /h2-console</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <Dashboard />
    </AttendanceProvider>
  );
}

