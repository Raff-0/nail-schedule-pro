import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Booking, Profile, Service, TimeSlot } from '@/types/nail-studio';

// ─── SERVICES ───────────────────────────────────────────────
export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setServices(data as Service[]);
        setLoading(false);
      });
  }, []);

  return { services, loading };
};

// ─── BOOKINGS (client) ───────────────────────────────────────
export const useMyBookings = (userId: string | undefined) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('bookings')
      .select('*, service:services(*)')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [userId]);

  return { bookings, loading, refetch: fetch };
};

// ─── BOOKINGS (manager) ──────────────────────────────────────
export const useAllBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, service:services(*), profile:profiles(*)')
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  return { bookings, loading, refetch: fetch };
};

// ─── PROFILES (all clients) ──────────────────────────────────
export const useAllProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'costumer')
      .order('name')
      .then(({ data }) => {
        if (data) setProfiles(data as Profile[]);
        setLoading(false);
      });
  }, []);

  return { profiles, loading };
};

// UUID del profilo ospite fisso (per prenotazioni senza account)
const GUEST_PROFILE_ID = '00000000-0000-0000-0000-000000000001';

// ─── CREATE BOOKING ──────────────────────────────────────────
export const createBooking = async (
  userId: string | null,
  serviceId: string,
  date: string,
  time: string,
  notes?: string,
  status: Booking['status'] = 'pending',
  guestName?: string,
  guestPhone?: string
): Promise<{ error: string | null }> => {
  // Always format time as HH:MM:00 (seconds constraint = 0)
  const timeWithSeconds = time.length === 5 ? `${time}:00` : time;
  
  const payload: Record<string, unknown> = {
    user_id: userId ?? GUEST_PROFILE_ID,
    service_id: serviceId,
    date,
    time: timeWithSeconds,
    status,
    ...(notes ? { notes } : {}),
    ...(guestName ? { guest_name: guestName } : {}),
    ...(guestPhone ? { guest_phone: guestPhone } : {}),
  };
  const { error } = await supabase.from('bookings').insert(payload);
  return { error: error?.message ?? null };
};

// ─── UPDATE BOOKING STATUS ───────────────────────────────────
export const updateBookingStatus = async (
  id: string,
  status: Booking['status']
): Promise<{ error: string | null }> => {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id);
  return { error: error?.message ?? null };
};

// ─── TIME SLOTS ──────────────────────────────────────────────
export const useTimeSlots = (date: string): { slots: TimeSlot[]; loading: boolean } => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);

    supabase
      .from('bookings')
      .select('time')
      .eq('date', date)
      .neq('status', 'cancelled')
      .then(({ data }) => {
        const bookedTimes = (data ?? []).map((b: { time: string }) => b.time.slice(0, 5));
        const generated: TimeSlot[] = [];
        for (let h = 9; h <= 18; h++) {
          for (const m of ['00', '30']) {
            if (h === 18 && m === '30') continue;
            const t = `${String(h).padStart(2, '0')}:${m}`;
            generated.push({ time: t, available: !bookedTimes.includes(t) });
          }
        }
        setSlots(generated);
        setLoading(false);
      });
  }, [date]);

  return { slots, loading };
};
