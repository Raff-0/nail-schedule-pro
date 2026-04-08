import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock, User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAllProfiles, useServices, useTimeSlots } from '@/hooks/useSupabase';
import { Profile, Service } from '@/types/nail-studio';
import { format, addDays, subDays, isToday } from 'date-fns';
import { it } from 'date-fns/locale';

interface Props {
  onBack: () => void;
  onConfirm: (
    clientId: string | null,
    serviceId: string,
    date: string,
    time: string,
    guestName?: string,
    guestPhone?: string
  ) => Promise<void>;
}

type ClientType = 'registered' | 'guest' | null;

const ManagerNewBookingPage = ({ onBack, onConfirm }: Props) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [clientType, setClientType] = useState<ClientType>(null);
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [weekBase, setWeekBase] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);

  const { profiles, loading: loadingProfiles } = useAllProfiles();
  const { services, loading: loadingServices } = useServices();
  const { slots, loading: loadingSlots } = useTimeSlots(selectedDate);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const startDay = weekBase.getDay() === 0 ? 6 : weekBase.getDay() - 1;
    return addDays(subDays(weekBase, startDay), i);
  });

  const displayName = clientType === 'guest' ? guestName : selectedClient?.name;

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    await onConfirm(
      selectedClient?.id ?? null,
      selectedService.id,
      selectedDate,
      selectedTime,
      clientType === 'guest' ? guestName : undefined,
      clientType === 'guest' ? guestPhone : undefined
    );
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={() => {
            if (step === 1) {
              if (clientType !== null) { setClientType(null); }
              else { onBack(); }
            } else {
              setStep((step - 1) as 1 | 2 | 3 | 4);
            }
          }}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-display font-semibold text-foreground">Nuovo Appuntamento</h1>
      </div>

      {/* Steps indicator */}
      <div className="px-6 py-3 flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-secondary'}`}
          />
        ))}
      </div>

      <motion.div
        key={`${step}-${clientType}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-6 pt-2"
      >
        {/* Step 1: Client type selection */}
        {step === 1 && clientType === null && (
          <div>
            <h2 className="text-xl font-display font-semibold mb-1">Tipo di cliente</h2>
            <p className="text-sm text-muted-foreground mb-5">Il cliente ha un account o è un ospite?</p>
            <div className="space-y-3">
              <button
                onClick={() => setClientType('registered')}
                className="w-full p-5 rounded-2xl border border-border bg-card text-left transition-all shadow-card hover:shadow-elevated hover:border-primary"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-hero flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Cliente registrato</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Seleziona da lista clienti</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setClientType('guest')}
                className="w-full p-5 rounded-2xl border border-border bg-card text-left transition-all shadow-card hover:shadow-elevated hover:border-primary"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <UserPlus className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Cliente ospite</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Inserisci nominativo e telefono</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 1 – registered client list */}
        {step === 1 && clientType === 'registered' && (
          <div>
            <h2 className="text-xl font-display font-semibold mb-1">Seleziona cliente</h2>
            <p className="text-sm text-muted-foreground mb-4">Chi è il cliente?</p>
            {loadingProfiles ? (
              <p className="text-sm text-muted-foreground text-center py-8">Caricamento...</p>
            ) : profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nessun cliente registrato</p>
            ) : (
              <div className="space-y-2 pb-6">
                {profiles.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => { setSelectedClient(client); setStep(2); }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all shadow-card hover:shadow-elevated ${
                      selectedClient?.id === client.id ? 'border-primary bg-rose-light' : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 1 – guest form */}
        {step === 1 && clientType === 'guest' && (
          <div>
            <h2 className="text-xl font-display font-semibold mb-1">Dati cliente ospite</h2>
            <p className="text-sm text-muted-foreground mb-5">Inserisci nominativo e contatto</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Nominativo *</label>
                <input
                  type="text"
                  placeholder="Es. Mario Rossi"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Telefono *</label>
                <input
                  type="tel"
                  placeholder="Es. 333 1234567"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!guestName.trim() || !guestPhone.trim()}
                className="w-full h-12 rounded-xl bg-gradient-hero text-primary-foreground font-semibold mt-2 shadow-elevated hover:opacity-90 transition-opacity"
              >
                Continua
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Service */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-display font-semibold mb-1">Scegli il servizio</h2>
            <p className="text-sm text-muted-foreground mb-4">Per {displayName}</p>
            {loadingServices ? (
              <p className="text-sm text-muted-foreground text-center py-8">Caricamento...</p>
            ) : (
              <div className="space-y-3 pb-6">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => { setSelectedService(service); setStep(3); }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all shadow-card hover:shadow-elevated ${
                      selectedService?.id === service.id ? 'border-primary bg-rose-light' : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{service.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{service.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {service.duration} min
                          </span>
                          <span className="font-semibold text-primary">€{service.price}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-display font-semibold mb-1">Data e orario</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedService?.icon} {selectedService?.name} — {selectedService?.duration} min
            </p>

            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setWeekBase(subDays(weekBase, 7))} className="p-2 rounded-xl hover:bg-secondary">
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
              <span className="text-sm font-medium capitalize">
                {format(weekBase, 'MMMM yyyy', { locale: it })}
              </span>
              <button onClick={() => setWeekBase(addDays(weekBase, 7))} className="p-2 rounded-xl hover:bg-secondary">
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            </div>

            <div className="flex gap-1 mb-5">
              {weekDays.map((d) => {
                const dStr = format(d, 'yyyy-MM-dd');
                return (
                  <button
                    key={dStr}
                    onClick={() => { setSelectedDate(dStr); setSelectedTime(''); }}
                    className={`flex-1 py-2 rounded-xl text-center transition-all ${
                      selectedDate === dStr
                        ? 'bg-primary text-primary-foreground'
                        : isToday(d)
                        ? 'bg-rose-light text-foreground'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <p className="text-[10px] uppercase opacity-70">{format(d, 'EEE', { locale: it })}</p>
                    <p className="text-sm font-semibold">{format(d, 'd')}</p>
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Orari disponibili
                </h3>
                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Caricamento...</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 pb-6">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => { setSelectedTime(slot.time); setStep(4); }}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                          selectedTime === slot.time
                            ? 'bg-primary text-primary-foreground'
                            : slot.available
                            ? 'bg-card border border-border hover:border-primary'
                            : 'bg-muted text-muted-foreground/40 cursor-not-allowed line-through'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && selectedService && (
          <div>
            <h2 className="text-xl font-display font-semibold mb-4">Conferma appuntamento</h2>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-4">
              {/* Client info */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0">
                  {clientType === 'guest'
                    ? <UserPlus className="h-4 w-4 text-primary-foreground" />
                    : <User className="h-4 w-4 text-primary-foreground" />
                  }
                </div>
                <div>
                  <p className="font-semibold text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {clientType === 'guest' ? `📞 ${guestPhone}` : selectedClient?.email}
                  </p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedService.icon}</span>
                <div>
                  <p className="font-semibold text-foreground">{selectedService.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedService.duration} minuti</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data</span>
                <span className="font-medium text-foreground capitalize">
                  {format(new Date(selectedDate), 'EEEE d MMMM', { locale: it })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Orario</span>
                <span className="font-medium text-foreground">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prezzo</span>
                <span className="font-semibold text-primary text-lg">€{selectedService.price}</span>
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-gradient-hero text-primary-foreground font-semibold mt-6 shadow-elevated hover:opacity-90 transition-opacity"
            >
              {submitting ? 'Salvataggio...' : 'Conferma Appuntamento ✅'}
            </Button>

            <button
              onClick={() => setStep(3)}
              className="w-full text-center mt-3 text-sm text-muted-foreground"
            >
              Modifica data/orario
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ManagerNewBookingPage;
