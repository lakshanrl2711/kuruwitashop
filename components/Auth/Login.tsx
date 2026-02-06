
import React, { useState } from 'react';
import { Smartphone, Lock, User as UserIcon, Fingerprint } from 'lucide-react';
import { User } from '../../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  shopName: string;
  footerText: string;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin, shopName, footerText }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-black text-4xl shadow-[0_0_50px_rgba(37,99,235,0.3)] neon-border mb-4">
            S
          </div>
          <h1 className="text-4xl font-black text-white neon-glow tracking-tight text-center">
            {shopName}
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium tracking-widest uppercase">Management System</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm font-semibold text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Sign In
              <Smartphone className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              className="w-full py-3 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
              onClick={() => alert("Biometric login simulated. In a real native app, this triggers local_auth.")}
            >
              <Fingerprint className="w-5 h-5 text-emerald-500" />
              Use Biometrics
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-slate-600 text-xs font-bold tracking-widest uppercase">
          {footerText}
        </p>
      </div>
    </div>
  );
};
