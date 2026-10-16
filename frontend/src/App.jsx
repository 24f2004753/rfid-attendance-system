import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import StudentManagement from './components/StudentManagement';
import AttendanceFeed from './components/AttendanceFeed';
import RFIDSimulatorModal from './components/RFIDSimulatorModal';
import { Radio, X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-cream-100 text-mauve-950">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start space-x-3 backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-300 text-emerald-900'
                : toast.type === 'warning'
                ? 'bg-amber-50/95 border-amber-300 text-amber-900'
                : toast.type === 'error'
                ? 'bg-rose-50/95 border-rose-300 text-rose-900'
                : 'bg-mauve-50/95 border-mauve-300 text-mauve-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600" />}
              {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600" />}
              {toast.type === 'info' && <Info className="h-5 w-5 text-mauve-600" />}
            </div>
            <div className="flex-1 text-xs">
              <p className="font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={dismissToast}
              className="text-mauve-400 hover:text-mauve-800 p-1 rounded-lg shrink-0"
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
        
        {/* Banner */}
        <div className="rounded-2xl p-6 bg-gradient-to-r from-white via-mauve-50/40 to-white border border-cream-300 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-mauve-600 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
                <Radio className="h-3.5 w-3.5 animate-pulse text-mauve-600" />
                <span>Simulation-Ready University IoT Architecture</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-mauve-950 tracking-tight">
                RFID-Based Student Attendance Portal
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-mauve-600 hover:bg-mauve-700 text-white shadow-md shadow-mauve-600/20 transition-all transform active:scale-95"
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
          <div className="flex bg-cream-100 p-1 rounded-xl border border-cream-300 text-xs">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'both' ? 'bg-mauve-600 text-white font-bold shadow-xs' : 'text-mauve-700 hover:text-mauve-950'
              }`}
            >
              Side-by-Side View
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'students' ? 'bg-mauve-600 text-white font-bold shadow-xs' : 'text-mauve-700 hover:text-mauve-950'
              }`}
            >
              Student Directory
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'feed' ? 'bg-mauve-600 text-white font-bold shadow-xs' : 'text-mauve-700 hover:text-mauve-950'
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
      <footer className="border-t border-cream-300 bg-white/70 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-xs text-mauve-600">
          <div className="flex items-center space-x-4">
            <span className="font-mono text-mauve-800">Backend: http://localhost:8080</span>
            <span className="text-cream-300">|</span>
            <span className="font-mono text-mauve-800">H2 Console: /h2-console</span>
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
