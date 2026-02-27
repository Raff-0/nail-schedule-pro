export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'manager';
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
  icon: string;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  // Joined fields
  profile?: Profile;
  service?: Service;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
