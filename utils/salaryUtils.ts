
import { WORK_RULES } from '../constants';

/**
 * Calculates OT pay based on checkout time.
 * Rules: OT starts at 6:00 PM, ends at 8:30 PM.
 * Rate: 75 LKR/hour, calculated by minutes.
 */
export const calculateOT = (checkOutTimeStr: string): { minutes: number; pay: number } => {
  const checkOut = new Date(checkOutTimeStr);
  
  // Set OT window for that day
  const otStart = new Date(checkOutTimeStr);
  const [startH, startM] = WORK_RULES.OT_START.split(':').map(Number);
  otStart.setHours(startH, startM, 0, 0);
  
  const otEnd = new Date(checkOutTimeStr);
  const [endH, endM] = WORK_RULES.OT_END.split(':').map(Number);
  otEnd.setHours(endH, endM, 0, 0);

  if (checkOut <= otStart) return { minutes: 0, pay: 0 };

  // OT capped at 8:30 PM
  const effectiveEnd = checkOut > otEnd ? otEnd : checkOut;
  
  const diffMs = effectiveEnd.getTime() - otStart.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  const hourlyRate = WORK_RULES.OT_RATE_PER_HOUR;
  const minuteRate = hourlyRate / 60;
  
  const pay = Math.round(diffMinutes * minuteRate);
  
  return { minutes: diffMinutes, pay };
};

export const checkIfLate = (checkInTimeStr: string): boolean => {
  const checkIn = new Date(checkInTimeStr);
  const threshold = new Date(checkInTimeStr);
  const [h, m] = WORK_RULES.LATE_THRESHOLD.split(':').map(Number);
  threshold.setHours(h, m, 0, 0);
  
  return checkIn > threshold;
};

export const formatCurrency = (val: number) => {
  return `LKR ${val.toLocaleString()}`;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // In meters
};
