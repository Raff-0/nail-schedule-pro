import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Booking, Service, TimeSlot } from '@/types/nail-studio';

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

// ─── CREATE BOOKING ──────────────────────────────────────────
export const createBooking = async (
  userId: string,
  serviceId: string,
  date: string,
  time: string,
  notes?: string
): Promise<{ error: string | null }> => {
  const { error } = await supabase.from('bookings').insert({
    user_id: userId,
    service_id: serviceId,
    date,
    time,
    notes,
    status: 'pending',
  });
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
