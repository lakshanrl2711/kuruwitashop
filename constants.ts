
export const SHOP_NAME = "SENANI KURUWITA";
export const FOOTER_TEXT = "System Developed by Mr Lakshan";
export const BOSS_WHATSAPP = "0775814859";

export const WORK_RULES = {
  OPEN_TIME: "08:00",
  LATE_THRESHOLD: "08:15",
  CLOSE_TIME: "18:00",
  OT_START: "18:00",
  OT_END: "20:30",
  OT_RATE_PER_HOUR: 75,
  GEOFENCE_RADIUS_METERS: 100, // 100 meters
};

// Default Admin and Employees as per request
export const INITIAL_USERS = [
  { id: 'admin-0', name: 'Admin Boss', username: 'admin', password: '1234', role: 'ADMIN', dailyPay: 0 },
  { id: 'emp-1', name: 'Shashikala', username: 'shashi', password: 'password', role: 'EMPLOYEE', dailyPay: 1200 },
  { id: 'emp-2', name: 'Avishka', username: 'avishka', password: 'password', role: 'EMPLOYEE', dailyPay: 1200 },
  { id: 'emp-3', name: 'Lakshan', username: 'lakshan', password: 'password', role: 'EMPLOYEE', dailyPay: 1200 },
];

// Mock Shop Location (Kuruwita, Sri Lanka area)
export const DEFAULT_SHOP_LOCATION = {
  lat: 6.7667,
  lng: 80.3667
};
