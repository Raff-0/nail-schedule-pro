import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MOCK_BOOKINGS, SERVICES } from "@/data/mock-data";
import { Booking } from "@/types/nail-studio";
import LoginPage from "./LoginPage";
import ClientHome from "./ClientHome";
import NewBookingPage from "./NewBookingPage";
import ManagerDashboard from "./ManagerDashboard";
import { toast } from "sonner";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [showNewBooking, setShowNewBooking] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Manager view
  if (user?.role === "manager") {
    return (
      <ManagerDashboard
        bookings={bookings}
        onUpdateStatus={(id, status) => {
          setBookings((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status } : b))
          );
          toast.success(
            status === "confirmed" ? "Prenotazione confermata!" : "Prenotazione aggiornata"
          );
        }}
      />
    );
  }

  // Client views
  if (showNewBooking) {
    return (
      <NewBookingPage
        onBack={() => setShowNewBooking(false)}
        onConfirm={(serviceId, date, time) => {
          const service = SERVICES.find((s) => s.id === serviceId)!;
          const newBooking: Booking = {
            id: `b${Date.now()}`,
            userId: user!.id,
            userName: user!.name,
            serviceId,
            serviceName: service.name,
            date,
            time,
            duration: service.duration,
            status: "pending",
            price: service.price,
          };
          setBookings((prev) => [...prev, newBooking]);
          setShowNewBooking(false);
          toast.success("Prenotazione inviata! ✨");
        }}
      />
    );
  }

  const userBookings = bookings.filter((b) => b.userId === user?.id);

  return (
    <ClientHome
      bookings={userBookings}
      onNewBooking={() => setShowNewBooking(true)}
    />
  );
};

export default Index;
