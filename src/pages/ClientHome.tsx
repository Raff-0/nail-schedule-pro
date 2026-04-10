import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyBookings, createBooking } from '@/hooks/useSupabase';
import { Booking } from '@/types/nail-studio';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import NewBookingPage from './NewBookingPage';

const statusLabels: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confermato', className: 'bg-success/10 text-success' },
  pending: { label: 'In attesa', className: 'bg-warning/10 text-warning' },
  cancelled: { label: 'Annullato', className: 'bg-destructive/10 text-destructive' },
  completed: { label: 'Completato', className: 'bg-muted text-muted-foreground' },
};

const ClientHome = () => {
  const { profile, logout } = useAuth();
  const { bookings, loading, refetch } = useMyBookings(profile?.id);
  const [showNewBooking, setShowNewBooking] = useState(false);

  if (showNewBooking) {
    return (
      <NewBookingPage
        onBack={() => setShowNewBooking(false)}
        onConfirm={async (serviceId: string, date: string, time: string) => {
          const { error } = await createBooking(profile?.id ?? null, serviceId, date, time, undefined, 'pending');
          if (error) {
            toast.error(`Errore: ${error}`);
          } else {
            toast.success('Prenotazione creata! ✅');
            setShowNewBooking(false);
            refetch();
          }
        }}
      />
    );
  }

  const upcoming = bookings
    .filter((b) => b.status !== 'cancelled' && b.status !== 'completed')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const past = bookings
    .filter((b) => b.status === 'completed' || b.status === 'cancelled')
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Ciao,</p>
          <h1 className="text-xl font-display font-semibold text-foreground">
            {profile?.name?.split(' ')[0]} ✨
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
          onClick={() => setShowNewBooking(true)}
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

      {/* Upcoming */}
      <div className="px-6">
        <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" /> I tuoi appuntamenti
        </h2>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Caricamento...</p>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-4xl mb-2">📅</p>
            <p className="text-sm">Nessun appuntamento in programma</p>
            <p className="text-xs mt-1">Prenotane uno nuovo!</p>
          </div>
        ) : (
          upcoming.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-base font-display font-semibold text-muted-foreground mt-6 mb-3">
              Storico
            </h2>
            {past.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const BookingCard = ({ booking }: { booking: Booking }) => {
  const st = statusLabels[booking.status] ?? statusLabels.pending;
  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-card mb-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-sm text-foreground">
            {booking.service?.icon} {booking.service?.name ?? '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {booking.service?.duration} min
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.className}`}>
          {st.label}
        </span>
      </div>
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span>📅 {format(new Date(booking.date), 'd MMM yyyy', { locale: it })}</span>
        <span>🕙 {booking.time.slice(0, 5)}</span>
      </div>
      <p className="text-primary font-bold text-base mt-2">€{booking.service?.price}</p>
    </div>
  );
};

export default ClientHome;
