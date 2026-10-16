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
    <div className="min-h-screen flex flex-col bg-[#F5EFEB] text-[#2A1726]">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start space-x-3 backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-[#F3E6F0] border-[#D1B8CC] text-[#4A1E3F]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-700" />}
              {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-700" />}
              {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-700" />}
              {toast.type === 'info' && <Info className="h-5 w-5 text-[#6E3B61]" />}
            </div>
            <div className="flex-1 text-xs">
              <p className="font-bold">{toast.message}</p>
            </div>
            <button
              onClick={dismissToast}
              className="text-[#5F4257] hover:text-[#2A1726] p-1 rounded-lg shrink-0 cursor-pointer"
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
        
        {/* Banner with 30%+ Mauve Depth */}
        <div className="banner-mauve rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[#E8D3E3] font-mono text-xs font-bold uppercase tracking-wider mb-1">
                <Radio className="h-3.5 w-3.5 animate-pulse text-[#E8D3E3]" />
                <span>Simulation-Ready University IoT Architecture</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                RFID-Based Student Attendance Portal
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#F3E6F0] hover:bg-white text-[#4A1E3F] border border-[#D1B8CC] shadow-md transition-all transform active:scale-95 cursor-pointer"
              >
                <Radio className="h-4 w-4 text-[#6E3B61]" />
                <span>Simulate RFID Tap</span>
              </button>
            </div>
          </div>
        </div>

        {/* Analytics & Metric Cards */}
        <MetricCards />

        {/* View Layout Filter Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex bg-[#EDE0EB] p-1.5 rounded-xl border border-[#D1B8CC] shadow-xs text-xs">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'both' ? 'tab-btn-active' : 'tab-btn-inactive'
              }`}
            >
              Side-by-Side View
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'students' ? 'tab-btn-active' : 'tab-btn-inactive'
              }`}
            >
              Student Directory
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'feed' ? 'tab-btn-active' : 'tab-btn-inactive'
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
      <footer className="border-t border-[#D6BED1] bg-[#EDE0EB]/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-xs text-[#5F4257] font-semibold">
          <div className="flex items-center space-x-4">
            <span className="font-mono text-[#4A1E3F] bg-white px-3 py-1 rounded-md border border-[#D1B8CC] shadow-2xs">
              Backend: http://localhost:8080
            </span>
            <span className="text-[#8E587F]">|</span>
            <span className="font-mono text-[#4A1E3F] bg-white px-3 py-1 rounded-md border border-[#D1B8CC] shadow-2xs">
              H2 Console: /h2-console
            </span>
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
