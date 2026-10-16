import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Radio, ShieldCheck, UserCheck, Lock, ArrowRight, Sparkles, Building2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAttendance();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick-select demo faculty profiles
  const DEMO_FACULTY = [
    {
      username: 'me_faculty',
      title: 'ME Faculty Login',
      name: 'Prof. Vikram Malhotra',
      dept: 'Mechanical Engineering',
      code: 'ME Branch',
      scope: 'Access limited strictly to Mechanical Engineering students',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      username: 'ce_faculty',
      title: 'CE Faculty Login',
      name: 'Prof. Sunita Rao',
      dept: 'Computer Science & Engineering',
      code: 'CE Branch',
      scope: 'Access limited strictly to Computer Engineering students',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    {
      username: 'hod',
      title: 'HOD (Head of Dept)',
      name: 'Dr. A. V. Raman',
      dept: 'All Engineering Branches',
      code: 'Super Access',
      scope: 'Universal access to mark & view attendance across ALL branches',
      badgeColor: 'bg-[#F3E6F0] text-[#4A1E3F] border-[#D1B8CC]',
    },
  ];

  const handleLogin = async (userToLogin, passToLogin) => {
    setLoading(true);
    setErrorMsg('');
    const res = await login(userToLogin, passToLogin || 'password123');
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to authenticate');
    }
    setLoading(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Please enter a username');
      return;
    }
    handleLogin(username.trim().toLowerCase(), password);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F5EFEB] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-300">
        
        {/* Brand & Portal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EDE0EB] border border-[#D1B8CC] text-[#4A1E3F] text-xs font-bold shadow-2xs">
            <Radio className="h-4 w-4 animate-pulse text-[#6E3B61]" />
            <span>Role-Based Faculty Access Control Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2A1726] tracking-tight">
            SmartLab RFID Attendance System
          </h1>
          <p className="text-sm text-[#5F4257] max-w-md mx-auto font-medium">
            Sign in with your department credentials to manage session attendance and RFID card authorizations.
          </p>
        </div>

        {/* 3 Quick-Select Faculty Demo Cards */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5F4257] flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-[#6E3B61]" />
              <span>1-Click Faculty Demo Login</span>
            </h2>
            <span className="text-[11px] text-[#5F4257] font-semibold">
              Select a faculty role to test department-specific permissions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEMO_FACULTY.map((faculty) => (
              <div
                key={faculty.username}
                onClick={() => handleLogin(faculty.username, 'password123')}
                className="bg-white rounded-2xl p-5 border-2 border-[#D6BED1] hover:border-[#6E3B61] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${faculty.badgeColor}`}>
                      {faculty.code}
                    </span>
                    <Building2 className="h-4 w-4 text-[#8E587F] group-hover:text-[#6E3B61] transition-colors" />
                  </div>

                  <h3 className="text-base font-extrabold text-[#2A1726] mt-3 group-hover:text-[#6E3B61] transition-colors">
                    {faculty.title}
                  </h3>
                  <div className="text-xs font-bold text-[#4A1E3F] mt-0.5">
                    {faculty.name}
                  </div>
                  <p className="text-[11px] text-[#5F4257] mt-2 leading-relaxed">
                    {faculty.scope}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#EAE2D8] flex items-center justify-between text-xs font-bold text-[#6E3B61] group-hover:translate-x-0.5 transition-transform">
                  <span>Sign In as {faculty.code}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Credentials Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D6BED1] shadow-sm max-w-md mx-auto w-full">
          <div className="flex items-center space-x-2 pb-4 border-b border-[#EAE2D8] mb-5">
            <Lock className="h-4 w-4 text-[#6E3B61]" />
            <h3 className="text-sm font-extrabold text-[#2A1726]">Manual Credentials Login</h3>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2A1726] mb-1">
                Faculty Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="me_faculty, ce_faculty, or hod"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF5F8] border border-[#D1B8CC] text-[#2A1726] placeholder-[#8E587F] focus:outline-none focus:border-[#6E3B61] focus:ring-1 focus:ring-[#6E3B61] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2A1726] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF5F8] border border-[#D1B8CC] text-[#2A1726] placeholder-[#8E587F] focus:outline-none focus:border-[#6E3B61] focus:ring-1 focus:ring-[#6E3B61] font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs btn-mauve-primary cursor-pointer active:scale-95 transition-all shadow-md mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="mt-4 text-center text-[11px] text-[#5F4257]">
            <span>Tip: Default password for all faculty is </span>
            <code className="bg-[#EDE0EB] px-1.5 py-0.5 rounded text-[#4A1E3F] font-bold">password123</code>
          </div>
        </div>

      </div>
    </div>
  );
}
