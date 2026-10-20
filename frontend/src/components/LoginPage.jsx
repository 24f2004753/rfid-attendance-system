import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Radio, Lock, User, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAttendance();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Please enter your faculty username');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await login(username.trim().toLowerCase(), password);
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F5EFEB] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-300">
        
        {/* Brand & Portal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EDE0EB] border border-[#D1B8CC] text-[#4A1E3F] text-xs font-bold shadow-2xs">
            <Radio className="h-4 w-4 animate-pulse text-[#6E3B61]" />
            <span>Role-Based Faculty Access Control Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#2A1726] tracking-tight">
            SmartLab RFID Attendance
          </h1>
          <p className="text-xs sm:text-sm text-[#5F4257] max-w-sm mx-auto font-medium">
            Sign in with your department credentials to manage session attendance and RFID card authorizations.
          </p>
        </div>

        {/* Credentials Login Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D6BED1] shadow-md w-full">
          <div className="flex items-center space-x-3 pb-4 border-b border-[#EAE2D8] mb-5">
            <div className="p-2.5 rounded-xl bg-[#F3E6F0] text-[#6E3B61] border border-[#D1B8CC]">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#2A1726]">Faculty Sign In</h3>
              <p className="text-[11px] text-[#5F4257] font-medium">Enter your username and password to proceed</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2A1726] mb-1.5">
                Faculty Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-[#8E587F]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. me_faculty, ce_faculty, hod"
                  autoComplete="username"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-[#FAF5F8] border border-[#D1B8CC] text-[#2A1726] placeholder-[#8E587F] focus:outline-none focus:border-[#6E3B61] focus:ring-1 focus:ring-[#6E3B61] font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2A1726] mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-[#8E587F]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-[#FAF5F8] border border-[#D1B8CC] text-[#2A1726] placeholder-[#8E587F] focus:outline-none focus:border-[#6E3B61] focus:ring-1 focus:ring-[#6E3B61] font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs btn-mauve-primary cursor-pointer active:scale-95 transition-all shadow-md mt-2 flex items-center justify-center space-x-2 font-bold"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#EAE2D8] text-center text-[11px] text-[#5F4257] space-y-1">
            <div>
              <span>Default password for faculty accounts: </span>
              <code className="bg-[#EDE0EB] px-1.5 py-0.5 rounded text-[#4A1E3F] font-bold font-mono">password123</code>
            </div>
            <div className="text-[10px] text-[#8E587F]">
              Accounts: <span className="font-mono font-semibold">me_faculty</span> &bull; <span className="font-mono font-semibold">ce_faculty</span> &bull; <span className="font-mono font-semibold">hod</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

