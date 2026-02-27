import { Booking, Service, TimeSlot } from "@/types/nail-studio";

export const SERVICES: Service[] = [
  { id: "1", name: "Manicure Classica", duration: 45, price: 25, category: "manicure", icon: "✨" },
  { id: "2", name: "Manicure Semipermanente", duration: 60, price: 35, category: "manicure", icon: "💅" },
  { id: "3", name: "Nail Art", duration: 90, price: 50, category: "nail-art", icon: "🎨" },
  { id: "4", name: "Ricostruzione Gel", duration: 120, price: 60, category: "ricostruzione", icon: "💎" },
  { id: "5", name: "Pedicure Estetica", duration: 50, price: 30, category: "pedicure", icon: "🦶" },
  { id: "6", name: "Refill Gel", duration: 75, price: 40, category: "ricostruzione", icon: "🔄" },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    userId: "u1",
    userName: "Laura Bianchi",
    serviceId: "2",
    serviceName: "Manicure Semipermanente",
    date: "2026-02-27",
    time: "10:00",
    duration: 60,
    status: "confirmed",
    price: 35,
  },
  {
    id: "b2",
    userId: "u2",
    userName: "Giulia Rossi",
    serviceId: "3",
    serviceName: "Nail Art",
    date: "2026-02-27",
    time: "11:30",
    duration: 90,
    status: "confirmed",
    price: 50,
  },
  {
    id: "b3",
    userId: "u1",
    userName: "Laura Bianchi",
    serviceId: "4",
    serviceName: "Ricostruzione Gel",
    date: "2026-02-28",
    time: "14:00",
    duration: 120,
    status: "pending",
    price: 60,
  },
  {
    id: "b4",
    userId: "u3",
    userName: "Anna Verdi",
    serviceId: "1",
    serviceName: "Manicure Classica",
    date: "2026-02-28",
    time: "09:00",
    duration: 45,
    status: "confirmed",
    price: 25,
  },
  {
    id: "b5",
    userId: "u2",
    userName: "Giulia Rossi",
    serviceId: "5",
    serviceName: "Pedicure Estetica",
    date: "2026-03-01",
    time: "16:00",
    duration: 50,
    status: "pending",
    price: 30,
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
