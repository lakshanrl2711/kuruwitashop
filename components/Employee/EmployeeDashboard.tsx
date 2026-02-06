
import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, MapPin, QrCode, Clock, History, DollarSign, CheckCircle, Smartphone } from 'lucide-react';
import { User, AttendanceRecord } from '../../types';
import { formatCurrency, calculateDistance } from '../../utils/salaryUtils';
import { DEFAULT_SHOP_LOCATION, WORK_RULES } from '../../constants';

interface EmployeeDashboardProps {
  user: User;
  attendance: AttendanceRecord[];
  markCheckIn: (userId: string, coords?: {lat: number, lng: number}) => void;
  markCheckOut: (userId: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, attendance, markCheckIn, markCheckOut }) => {
  const [activeMode, setActiveMode] = useState<'status' | 'history'>('status');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'in_range' | 'out_of_range'>('idle');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(a => a.userId === user.id && a.date === today);
  const myHistory = attendance.filter(a => a.userId === user.id);

  const checkLocation = () => {
    setLocationStatus('checking');
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      setLocationStatus('idle');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = calculateDistance(
          pos.coords.latitude, pos.coords.longitude,
          DEFAULT_SHOP_LOCATION.lat, DEFAULT_SHOP_LOCATION.lng
        );
        
        if (dist <= WORK_RULES.GEOFENCE_RADIUS_METERS) {
          setLocationStatus('in_range');
          markCheckIn(user.id, { lat: pos.coords.latitude, lng: pos.coords.longitude });
        } else {
          setLocationStatus('out_of_range');
          alert(`You are too far from the shop (${Math.round(dist)}m away). Must be within ${WORK_RULES.GEOFENCE_RADIUS_METERS}m.`);
        }
      },
      (err) => {
        alert("Error getting location. Please allow GPS.");
        setLocationStatus('idle');
      }
    );
  };

  const handleQRScan = () => {
    alert("In a real mobile app, this opens the camera scanner. Mocking scan success...");
    markCheckIn(user.id);
  };

  return (
    <div className="space-y-6">
      {/* Employee Welcome Card */}
      <div className="relative overflow-hidden glass rounded-[32px] p-8 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 p-8">
          <Clock className="w-12 h-12 text-blue-500/20 animate-pulse" />
        </div>
        <div className="relative z-10">
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Employee Portal</p>
          <h2 className="text-3xl font-black mb-1">Welcome, {user.name}</h2>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {currentTime.toLocaleTimeString()}
          </div>
          
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Today's Status</p>
              <p className={`text-sm font-black ${todayRecord ? 'text-emerald-400' : 'text-amber-400'}`}>
                {todayRecord ? (todayRecord.checkOut ? 'COMPLETED' : 'WORKING') : 'NOT STARTED'}
              </p>
            </div>
            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Daily Pay</p>
              <p className="text-sm font-black text-white">{formatCurrency(user.dailyPay)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Tabs */}
      <div className="flex gap-2 p-1 glass rounded-2xl border border-slate-800 w-full">
        <button 
          onClick={() => setActiveMode('status')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeMode === 'status' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Smartphone className="w-4 h-4" />
          Attendance
        </button>
        <button 
          onClick={() => setActiveMode('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeMode === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <History className="w-4 h-4" />
          History
        </button>
      </div>

      {activeMode === 'status' && (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!todayRecord ? (
            <div className="space-y-4">
              <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Check In Methods</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionButton 
                  label="GPS Validation" 
                  icon={<MapPin />} 
                  desc="Check-in using location" 
                  onClick={checkLocation}
                  loading={locationStatus === 'checking'}
                />
                <ActionButton 
                  label="Scan QR Code" 
                  icon={<QrCode />} 
                  desc="Scan shop entrance code" 
                  onClick={handleQRScan}
                />
              </div>
              <button 
                onClick={() => markCheckIn(user.id)}
                className="w-full py-6 glass rounded-3xl border border-slate-800 hover:border-emerald-500/50 group transition-all"
              >
                <div className="flex flex-col items-center">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <LogIn />
                  </div>
                  <span className="font-black text-lg">Direct Check-In</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Manual Override</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="glass rounded-3xl p-8 border border-emerald-500/30 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-2">Checked In Successfully</h3>
              <p className="text-slate-400 font-medium mb-8">
                Entry recorded at <span className="text-white font-bold">{new Date(todayRecord.checkIn).toLocaleTimeString()}</span>
              </p>
              
              {!todayRecord.checkOut ? (
                <button 
                  onClick={() => markCheckOut(user.id)}
                  className="w-full py-5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-600/20 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <LogOut className="w-6 h-6" />
                  Check Out Now
                </button>
              ) : (
                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Work Day Completed</p>
                  <p className="text-white font-black text-xl">OT Earned: {formatCurrency(todayRecord.otPay)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeMode === 'history' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black">Monthly History</h3>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Estimated Earned</p>
              <p className="text-lg font-black text-emerald-400">
                {formatCurrency(myHistory.reduce((s, r) => s + user.dailyPay + r.otPay, 0))}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {myHistory.slice().reverse().map(rec => (
              <div key={rec.id} className="glass p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">{new Date(rec.date).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}</p>
                  <p className="font-bold text-white text-sm">
                    {new Date(rec.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {rec.checkOut ? ` - ${new Date(rec.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ' (Working)'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-amber-400">+{formatCurrency(rec.otPay)} OT</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {rec.isLate ? 'Late Entry' : 'On Time'}
                  </p>
                </div>
              </div>
            ))}
            {myHistory.length === 0 && (
              <div className="text-center py-12 text-slate-600 font-medium">No records found yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ label, icon, desc, onClick, loading }: { label: string, icon: React.ReactNode, desc: string, onClick: () => void, loading?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className="flex items-center gap-4 p-5 glass border border-slate-800 rounded-[24px] hover:border-blue-500/50 transition-all text-left active:scale-[0.98]"
  >
    <div className={`w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0 ${loading ? 'animate-pulse' : ''}`}>
      {icon}
    </div>
    <div>
      <h4 className="font-black text-white">{label}</h4>
      <p className="text-xs text-slate-500 font-medium">{desc}</p>
    </div>
  </button>
);
