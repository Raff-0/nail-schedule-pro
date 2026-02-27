import { motion } from "framer-motion";
import { Plus, Calendar, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Booking } from "@/types/nail-studio";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface ClientHomeProps {
  bookings: Booking[];
  onNewBooking: () => void;
}

const statusLabels: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confermato", className: "bg-success/10 text-success" },
  pending: { label: "In attesa", className: "bg-warning/10 text-warning" },
  cancelled: { label: "Annullato", className: "bg-destructive/10 text-destructive" },
  completed: { label: "Completato", className: "bg-muted text-muted-foreground" },
};

const ClientHome = ({ bookings, onNewBooking }: ClientHomeProps) => {
  const { user, logout } = useAuth();

  const upcoming = bookings
    .filter((b) => b.status !== "cancelled" && b.status !== "completed")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Ciao,</p>
          <h1 className="text-xl font-display font-semibold text-foreground">
            {user?.name?.split(" ")[0]} ✨
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-hero flex items-center justify-center">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <button onClick={logout} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* New Booking CTA */}
      <div className="px-6 mb-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onNewBooking}
          className="w-full p-5 rounded-2xl bg-gradient-hero text-primary-foreground shadow-elevated flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-base">Prenota un appuntamento</p>
            <p className="text-sm opacity-80">Scegli servizio, data e orario</p>
          </div>
        </motion.button>
      </div>

      {/* Upcoming Bookings */}
      <div className="px-6">
        <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" /> I tuoi appuntamenti
        </h2>

        {upcoming.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">💅</p>
            <p className="text-muted-foreground text-sm">Nessun appuntamento in programma</p>
            <p className="text-muted-foreground text-xs mt-1">Prenota il tuo primo trattamento!</p>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {upcoming.map((booking, i) => {
              const status = statusLabels[booking.status];
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl bg-card border border-border shadow-card"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-foreground">{booking.serviceName}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      📅 {format(new Date(booking.date), "d MMM", { locale: it })}
                    </span>
                    <span>🕐 {booking.time}</span>
                    <span className="ml-auto font-semibold text-primary">€{booking.price}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientHome;
