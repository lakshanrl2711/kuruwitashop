
import React, { useState, useEffect, useCallback } from 'react';
import { LogIn, Users, Calendar, LayoutDashboard, Settings, LogOut, CheckCircle, Clock, MapPin, QrCode, FileText, UserPlus, Trash2, Smartphone } from 'lucide-react';
import { User, AttendanceRecord, Role } from './types';
import { INITIAL_USERS, SHOP_NAME, FOOTER_TEXT, BOSS_WHATSAPP, DEFAULT_SHOP_LOCATION, WORK_RULES } from './constants';
import { calculateOT, checkIfLate, formatCurrency, calculateDistance } from './utils/salaryUtils';
import { Login } from './components/Auth/Login';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { EmployeeDashboard } from './components/Employee/EmployeeDashboard';

const App: React.FC = () => {
  // Persistence state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('senani_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('senani_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('senani_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('senani_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('senani_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('senani_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('senani_current_user');
  };

  const addEmployee = (newEmp: User) => {
    setUsers(prev => [...prev, newEmp]);
  };

  const removeEmployee = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const markCheckIn = (userId: string, coords?: {lat: number, lng: number}) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if already checked in today
    if (attendance.some(a => a.userId === userId && a.date === today)) {
      alert("Already checked in today!");
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    const record: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName: user.name,
      date: today,
      checkIn: now.toISOString(),
      isLate: checkIfLate(now.toISOString()),
      otMinutes: 0,
      otPay: 0,
      location: coords
    };

    setAttendance(prev => [...prev, record]);

    // Send WhatsApp Mock
    const message = encodeURIComponent(`${user.name} checked IN at ${now.toLocaleTimeString()}\nShop: ${SHOP_NAME}`);
    window.open(`https://wa.me/${BOSS_WHATSAPP}?text=${message}`, '_blank');
  };

  const markCheckOut = (userId: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    setAttendance(prev => prev.map(rec => {
      if (rec.userId === userId && rec.date === today && !rec.checkOut) {
        const { minutes, pay } = calculateOT(now.toISOString());
        
        // Send WhatsApp Mock
        const message = encodeURIComponent(`${rec.userName} checked OUT at ${now.toLocaleTimeString()}\nOT Earned: LKR ${pay}`);
        window.open(`https://wa.me/${BOSS_WHATSAPP}?text=${message}`, '_blank');

        return {
          ...rec,
          checkOut: now.toISOString(),
          otMinutes: minutes,
          otPay: pay
        };
      }
      return rec;
    }));
  };

  if (!currentUser) {
    return (
      <Login 
        users={users} 
        onLogin={handleLogin} 
        shopName={SHOP_NAME} 
        footerText={FOOTER_TEXT} 
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className="sticky top-0 z-50 glass border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-xl neon-border">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 text-lg leading-tight">
              {SHOP_NAME}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Attendance & Salary</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Clock className="w-5 h-5 text-blue-400" /> : <Clock className="w-5 h-5 text-emerald-500" />}
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {currentUser.role === 'ADMIN' ? (
          <AdminDashboard 
            users={users} 
            attendance={attendance} 
            addEmployee={addEmployee}
            removeEmployee={removeEmployee}
            setUsers={setUsers}
          />
        ) : (
          <EmployeeDashboard 
            user={currentUser} 
            attendance={attendance} 
            markCheckIn={markCheckIn}
            markCheckOut={markCheckOut}
          />
        )}
      </main>

      <footer className="py-8 text-center border-t border-slate-900 mt-12 bg-slate-950/50">
        <p className="text-slate-500 text-xs font-medium tracking-wide">
          &copy; {new Date().getFullYear()} {SHOP_NAME} | {FOOTER_TEXT}
        </p>
      </footer>
    </div>
  );
};

export default App;
