
import React, { useState, useMemo } from 'react';
/* Added missing imports: LayoutDashboard, FileText */
import { UserPlus, Users, Calendar, TrendingUp, DollarSign, Download, Trash2, QrCode, LayoutDashboard, FileText } from 'lucide-react';
import { User, AttendanceRecord } from '../../types';
import { formatCurrency } from '../../utils/salaryUtils';
import { BOSS_WHATSAPP } from '../../constants';

interface AdminDashboardProps {
  users: User[];
  attendance: AttendanceRecord[];
  addEmployee: (user: User) => void;
  removeEmployee: (id: string) => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, attendance, addEmployee, removeEmployee, setUsers }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', username: '', password: '', dailyPay: 1200 });
  const [activeTab, setActiveTab] = useState<'stats' | 'employees' | 'logs'>('stats');

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    const presentToday = attendance.filter(a => a.date === today).length;
    const totalOTToday = attendance.filter(a => a.date === today).reduce((sum, a) => sum + a.otPay, 0);
    
    const monthlyAttendance = attendance.filter(a => a.date.startsWith(currentMonth));
    const monthlyOT = monthlyAttendance.reduce((sum, a) => sum + a.otPay, 0);
    
    // Estimate basic pay for days present this month
    const monthlyBasic = monthlyAttendance.reduce((sum, a) => {
      const user = users.find(u => u.id === a.userId);
      return sum + (user?.dailyPay || 0);
    }, 0);

    return {
      totalEmployees: users.filter(u => u.role === 'EMPLOYEE').length,
      presentToday,
      otToday: totalOTToday,
      monthlyTotalCost: monthlyBasic + monthlyOT
    };
  }, [users, attendance]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `emp-${Date.now()}`;
    addEmployee({ ...newEmp, id, role: 'EMPLOYEE' });
    setNewEmp({ name: '', username: '', password: '', dailyPay: 1200 });
    setShowAddModal(false);
  };

  const generatePayslip = (user: User) => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const userAttendance = attendance.filter(a => a.userId === user.id && a.date.startsWith(currentMonth));
    const totalOTPay = userAttendance.reduce((sum, a) => sum + a.otPay, 0);
    const basicPay = userAttendance.length * user.dailyPay;
    const total = basicPay + totalOTPay;

    const slipContent = `
--- PAYSLIP: ${user.name} ---
Month: ${currentMonth}
Days Worked: ${userAttendance.length}
Basic Salary: LKR ${basicPay}
OT Earned: LKR ${totalOTPay}
-------------------------
TOTAL PAYABLE: LKR ${total}
-------------------------
SENANI KURUWITA
    `.trim();

    const message = encodeURIComponent(slipContent);
    window.open(`https://wa.me/${BOSS_WHATSAPP}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex gap-2 p-1 glass rounded-2xl border border-slate-800 w-fit">
        {[
          { id: 'stats', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'employees', label: 'Staff', icon: Users },
          { id: 'logs', label: 'Records', icon: FileText }
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Staff" value={stats.totalEmployees} icon={<Users className="w-5 h-5" />} color="text-blue-400" />
            <StatCard label="Today Present" value={stats.presentToday} icon={<Calendar className="w-5 h-5" />} color="text-emerald-400" />
            <StatCard label="Today OT" value={formatCurrency(stats.otToday)} icon={<TrendingUp className="w-5 h-5" />} color="text-purple-400" />
            <StatCard label="Monthly Cost" value={formatCurrency(stats.monthlyTotalCost)} icon={<DollarSign className="w-5 h-5" />} color="text-amber-400" />
          </div>

          <div className="glass rounded-3xl p-6 border border-slate-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-400" />
              Dynamic Shop QR
            </h3>
            <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-dashed border-slate-700">
              <div className="w-48 h-48 bg-white p-4 rounded-xl shadow-2xl">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SENANI_CHECK_IN_${new Date().toLocaleDateString()}`} alt="QR Code" />
              </div>
              <p className="mt-6 text-slate-400 text-sm font-medium">Display this at the entrance for employees to scan</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black">Employee List</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add New
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.filter(u => u.role === 'EMPLOYEE').map(emp => (
              <div key={emp.id} className="glass p-5 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold text-lg border border-slate-700">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{emp.name}</h4>
                    <p className="text-slate-500 text-xs font-semibold">@{emp.username} • {formatCurrency(emp.dailyPay)}/day</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => generatePayslip(emp)}
                    title="Send Payslip"
                    className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => removeEmployee(emp.id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="glass rounded-3xl overflow-hidden border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">In/Out</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Late</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">OT Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {attendance.slice().reverse().map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-300">{rec.date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-white">{rec.userName}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      <span className="text-emerald-400">{new Date(rec.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      {rec.checkOut ? ` → ` : ''}
                      <span className="text-blue-400">{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {rec.isLate ? 
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-black">LATE</span> : 
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black">ON TIME</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-amber-400">{formatCurrency(rec.otPay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass w-full max-w-md rounded-3xl p-8 border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black mb-6">Register Staff</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white font-medium"
                placeholder="Full Name"
                required
                value={newEmp.name}
                onChange={e => setNewEmp({...newEmp, name: e.target.value})}
              />
              <input
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white font-medium"
                placeholder="Username"
                required
                value={newEmp.username}
                onChange={e => setNewEmp({...newEmp, username: e.target.value})}
              />
              <input
                type="password"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white font-medium"
                placeholder="Password"
                required
                value={newEmp.password}
                onChange={e => setNewEmp({...newEmp, password: e.target.value})}
              />
              <input
                type="number"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white font-medium"
                placeholder="Daily Salary (LKR)"
                required
                value={newEmp.dailyPay}
                onChange={e => setNewEmp({...newEmp, dailyPay: parseInt(e.target.value)})}
              />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: { label: string, value: any, icon: React.ReactNode, color: string }) => (
  <div className="glass p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all group">
    <div className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center mb-4 border border-slate-800 ${color} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
    <p className="text-xl font-black mt-1 text-white">{value}</p>
  </div>
);
