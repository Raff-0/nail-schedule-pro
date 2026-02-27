export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  category: "manicure" | "pedicure" | "nail-art" | "ricostruzione";
  icon: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  price: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "client" | "manager";
  avatar?: string;
}
