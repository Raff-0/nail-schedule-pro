import { Booking, Service, TimeSlot } from "@/types/nail-studio";

export const SERVICES: Service[] = [
  { id: "1", name: "Manicure Classica", duration: 45, price: 25, category: "manicure", icon: "✨", created_at: "2026-01-01" },
  { id: "2", name: "Manicure Semipermanente", duration: 60, price: 35, category: "manicure", icon: "💅", created_at: "2026-01-01" },
  { id: "3", name: "Nail Art", duration: 90, price: 50, category: "nail-art", icon: "🎨", created_at: "2026-01-01" },
  { id: "4", name: "Ricostruzione Gel", duration: 120, price: 60, category: "ricostruzione", icon: "💎", created_at: "2026-01-01" },
  { id: "5", name: "Pedicure Estetica", duration: 50, price: 30, category: "pedicure", icon: "🦶", created_at: "2026-01-01" },
  { id: "6", name: "Refill Gel", duration: 75, price: 40, category: "ricostruzione", icon: "🔄", created_at: "2026-01-01" },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    user_id: "u1",
    service_id: "2",
    date: "2026-03-28",
    time: "10:00",
    status: "confirmed",
    created_at: "2026-03-20",
  },
  {
    id: "b2",
    user_id: "u2",
    service_id: "3",
    date: "2026-03-28",
    time: "11:30",
    status: "confirmed",
    created_at: "2026-03-20",
  },
  {
    id: "b3",
    user_id: "u1",
    service_id: "4",
    date: "2026-03-29",
    time: "14:00",
    status: "pending",
    created_at: "2026-03-21",
  },
  {
    id: "b4",
    user_id: "u3",
    service_id: "1",
    date: "2026-03-29",
    time: "09:00",
    status: "confirmed",
    created_at: "2026-03-21",
  },
  {
    id: "b5",
    user_id: "u2",
    service_id: "5",
    date: "2026-03-30",
    time: "16:00",
    status: "pending",
    created_at: "2026-03-22",
  },
];

export const generateTimeSlots = (date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const bookedTimes = MOCK_BOOKINGS
    .filter(b => b.date === date)
    .map(b => b.time);
  
  for (let hour = 9; hour <= 18; hour++) {
    for (const min of ["00", "30"]) {
      if (hour === 18 && min === "30") continue;
      const time = `${hour.toString().padStart(2, "0")}:${min}`;
      slots.push({
        time,
        available: !bookedTimes.includes(time),
      });
    }
  }
  return slots;
};
