
export type Role = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  dailyPay: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string; // ISO Date YYYY-MM-DD
  checkIn: string; // ISO Time
  checkOut?: string; // ISO Time
  isLate: boolean;
  otMinutes: number;
  otPay: number;
  location?: { lat: number; lng: number };
}

export interface SalaryReport {
  userId: string;
  month: string; // YYYY-MM
  totalDays: number;
  totalOTPay: number;
  totalSalary: number;
  presentDays: string[]; // List of dates
}

export interface AppSettings {
  isDarkMode: boolean;
  shopLocation: { lat: number; lng: number };
}
