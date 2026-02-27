import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Users, TrendingUp, Clock, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAllBookings, updateBookingStatus } from '@/hooks/useSupabase';
import { Booking } from '@/types/nail-studio';
import { format, addDays, subDays, isToday, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  confirmed: 'border-l-success',
  pending: 'border-l-warning',
  cancelled: 'border-l-destructive',
  completed: 'border-l-muted-foreground',
};

const ManagerDashboard = () => {
  const { profile, logout } = useAuth();
  const { bookings, loading, refetch } = useAllBookings();
  const [view, setView] = useState<'dashboard' | 'agenda'>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookings.filter((b) => b.date === todayStr);
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const todayRevenue = todayBookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.service?.price ?? 0), 0);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayBookings = bookings
    .filter((b) => b.date === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const startDay = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1;
    return addDays(subDays(selectedDate, startDay), i);
  });

  const handleStatus = async (id: string, status: Booking['status']) => {
    const { error } = await updateBookingStatus(id, status);
    if (error) {
      toast.error('Errore durante l\'aggiornamento');
    } else {
      toast.success(status === 'confirmed' ? 'Prenotazione confermata! ✅' : 'Prenotazione aggiornata');
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Gestione</p>
          <h1 className="text-xl font-display font-semibold text-foreground">{profile?.name}</h1>
        </div>
        <button onClick={logout} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Tab Switch */}
      <div className="px-6 mb-4">
        <div className="flex bg-secondary rounded-xl p-1">
          {(['dashboard', 'agenda'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                view === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {tab === 'dashboard' ? 'Dashboard' : 'Agenda'}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: CalendarDays, label: 'Oggi', value: todayBookings.length, color: 'text-primary' },
              { icon: Clock, label: 'In attesa', value: pendingBookings.length, color: 'text-warning' },
              { icon: TrendingUp, label: 'Incasso oggi', value: `€${todayRevenue}`, color: 'text-success' },
              { icon: Users, label: 'Totale', value: bookings.length, color: 'text-accent' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-2xl bg-card border border-border shadow-card"
              >
                <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <h3 className="text-base font-display font-semibold mb-3 text-foreground">
            Prenotazioni in attesa
          </h3>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Caricamento...</p>
          ) : pendingBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nessuna prenotazione in attesa ✨</p>
          ) : (
            <div className="space-y-3 pb-6">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="p-4 rounded-2xl bg-card border border-border shadow-card">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{booking.profile?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.service?.icon} {booking.service?.name}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(booking.date), 'd MMM', { locale: it })} • {booking.time.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleStatus(booking.id, 'confirmed')}
                      className="flex-1 py-2 rounded-xl bg-success text-success-foreground text-xs font-medium"
                    >
                      Conferma
                    </button>
                    <button
                      onClick={() => handleStatus(booking.id, 'cancelled')}
                      className="flex-1 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-medium"
                    >
                      Rifiuta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Agenda View */}
      {view === 'agenda' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setSelectedDate(subDays(selectedDate, 7))} className="p-2 rounded-xl hover:bg-secondary">
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <span className="text-sm font-medium text-foreground capitalize">
              {format(selectedDate, 'MMMM yyyy', { locale: it })}
            </span>
            <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="p-2 rounded-xl hover:bg-secondary">
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </div>

          <div className="flex gap-1 mb-6">
            {weekDays.map((d) => (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(d)}
                className={`flex-1 py-2 rounded-xl text-center transition-all ${
                  isSameDay(d, selectedDate)
                    ? 'bg-primary text-primary-foreground'
                    : isToday(d)
                    ? 'bg-rose-light text-foreground'
                    : 'hover:bg-secondary'
                }`}
              >
                <p className="text-[10px] uppercase opacity-70">{format(d, 'EEE', { locale: it })}</p>
                <p className="text-sm font-semibold">{format(d, 'd')}</p>
              </button>
            ))}
          </div>

          <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
            {format(selectedDate, 'EEEE d MMMM', { locale: it })}
          </h3>

          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Caricamento...</p>
          ) : dayBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm text-muted-foreground">Nessun appuntamento</p>
            </div>
          ) : (
            <div className="space-y-2 pb-8">
              {dayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`p-4 rounded-2xl bg-card border border-border shadow-card border-l-4 ${statusColors[booking.status]}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{booking.time.slice(0, 5)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{booking.profile?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {booking.service?.icon} {booking.service?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.service?.duration} min • €{booking.service?.price}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ManagerDashboard;
