import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyBookings, createBooking } from '@/hooks/useSupabase';
import { Booking } from '@/types/nail-studio';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import NewBookingPage from './NewBookingPage';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const statusLabels: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confermato', className: 'bg-success/10 text-success' },
  pending: { label: 'In attesa', className: 'bg-warning/10 text-warning' },
  cancelled: { label: 'Annullato', className: 'bg-destructive/10 text-destructive' },
  completed: { label: 'Completato', className: 'bg-muted text-muted-foreground' },
};

const productSlides = [
  {
    id: 1,
    title: 'Kit Glow Builder Gel',
    subtitle: 'Finish brillante e lunga tenuta',
    price: '€29',
    image:
      'https://images.unsplash.com/photo-1610992235823-f167d7ee0d56?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    title: 'Polish Velvet Rose',
    subtitle: 'Colore intenso con effetto seta',
    price: '€16',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    title: 'Nail Care Serum Pro',
    subtitle: 'Nutriente quotidiano per unghie forti',
    price: '€22',
    image:
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    title: 'Top Coat Mirror',
    subtitle: 'Protezione extra con effetto specchio',
    price: '€14',
    image:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    title: 'Set Lime Precision',
    subtitle: 'Sagomatura precisa e delicata',
    price: '€18',
    image:
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1200&q=80',
  },
];

const ClientHome = () => {
  const { profile, logout } = useAuth();
  const { bookings, loading, refetch } = useMyBookings(profile?.id);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setActiveSlide(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);

    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
    };
  }, [carouselApi]);

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
          {/*<div className="h-10 w-10 rounded-full bg-gradient-hero flex items-center justify-center">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>*/}
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
        ) : upcoming.length === 1 ? (
          <BookingCard booking={upcoming[0]} />
        ) : (
          <div className="relative pb-10 pt-8">
            <Carousel
              orientation="vertical"
              opts={{ align: 'start', loop: false, slidesToScroll: 1 }}
              className="w-full"
            >
              <CarouselContent className="h-[190px]">
                {upcoming.map((booking) => (
                  <CarouselItem key={booking.id} className="basis-full">
                    <BookingCard booking={booking} className="mb-0" />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="-top-1 left-1/2 -translate-x-1/2 border-border bg-background text-foreground hover:bg-secondary" />
              <CarouselNext className="-bottom-1 left-1/2 -translate-x-1/2 border-border bg-background text-foreground hover:bg-secondary" />
            </Carousel>
          </div>
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

        <section className="mt-8 mb-8">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground">Prodotti consigliati</h2>
              <p className="text-xs text-muted-foreground">Scorri le novita selezionate per te</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              Shop
            </span>
          </div>

          <Carousel
            setApi={setCarouselApi}
            opts={{ align: 'start', loop: true, slidesToScroll: 1 }}
            className="w-full"
          >
            <CarouselContent>
              {productSlides.map((product, index) => (
                <CarouselItem key={product.id} className="basis-4/5 sm:basis-1/2 md:basis-1/3 lg:basis-1/5">
                  <motion.article
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="relative overflow-hidden rounded-3xl border border-border shadow-card"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-48 w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold leading-tight">{product.title}</p>
                          <p className="text-xs text-white/85 mt-1">{product.subtitle}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-sm font-semibold">
                          {product.price}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 border-0 bg-black/35 text-white hover:bg-black/50 disabled:opacity-20" />
            <CarouselNext className="right-3 top-1/2 -translate-y-1/2 border-0 bg-black/35 text-white hover:bg-black/50 disabled:opacity-20" />
          </Carousel>

          <div className="mt-3 flex justify-center gap-2">
            {productSlides.map((slide, index) => (
              <button
                key={slide.id}
                aria-label={`Vai alla slide ${index + 1}`}
                onClick={() => carouselApi?.scrollTo(index)}
                className={`h-1.5 rounded-full transition-all ${
                  activeSlide === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/40'
                }`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const BookingCard = ({ booking, className = 'mb-3' }: { booking: Booking; className?: string }) => {
  const st = statusLabels[booking.status] ?? statusLabels.pending;
  return (
    <div className={`bg-card rounded-2xl p-4 border border-border shadow-card ${className}`}>
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
