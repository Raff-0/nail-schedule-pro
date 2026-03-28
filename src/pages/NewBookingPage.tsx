import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICES, generateTimeSlots } from "@/data/mock-data";
import { Service } from "@/types/nail-studio";
import { format, addDays } from "date-fns";
import { it } from "date-fns/locale";

interface NewBookingPageProps {
  onBack: () => void;
  onConfirm: (serviceId: string, date: string, time: string) => void;
}

const NewBookingPage = ({ onBack, onConfirm }: NewBookingPageProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const next30Days = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, "yyyy-MM-dd"),
      day: format(date, "EEE", { locale: it }),
      number: format(date, "d"),
      month: format(date, "MMM", { locale: it }),
    };
  });

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-display font-semibold text-foreground">Nuova Prenotazione</h1>
      </div>

      {/* Steps indicator */}
      <div className="px-6 py-3 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-secondary"}`} />
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-6 pt-2"
      >
        {/* Step 1: Service */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-display font-semibold mb-1">Scegli il servizio</h2>
            <p className="text-sm text-muted-foreground mb-4">Cosa desideri fare oggi?</p>
            <div className="space-y-3">
              {SERVICES.map((service) => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service); setStep(2); }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all shadow-card hover:shadow-elevated ${
                    selectedService?.id === service.id
                      ? "border-primary bg-rose-light"
                      : "border-border bg-card"
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
          </div>
        )}

        {/* Step 2: Date */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-display font-semibold mb-1">Scegli la data</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedService?.name} — {selectedService?.duration} min
            </p>
            
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
              {next30Days.map((d) => (
                <button
                  key={d.value}
                  onClick={() => { setSelectedDate(d.value); setSelectedTime(""); }}
                  className={`flex-shrink-0 w-16 p-3 rounded-2xl text-center transition-all ${
                    selectedDate === d.value
                      ? "bg-primary text-primary-foreground shadow-elevated"
                      : "bg-card border border-border"
                  }`}
                >
                  <p className="text-xs uppercase opacity-70">{d.day}</p>
                  <p className="text-lg font-semibold">{d.number}</p>
                  <p className="text-xs capitalize opacity-70">{d.month}</p>
                </button>
              ))}
            </div>

            {selectedDate && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Orari disponibili
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => { setSelectedTime(slot.time); setStep(3); }}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedTime === slot.time
                          ? "bg-primary text-primary-foreground"
                          : slot.available
                          ? "bg-card border border-border hover:border-primary"
                          : "bg-muted text-muted-foreground/40 cursor-not-allowed line-through"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedService && (
          <div>
            <h2 className="text-xl font-display font-semibold mb-4">Conferma prenotazione</h2>
            
            <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-4">
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
                <span className="font-medium text-foreground">
                  {format(new Date(selectedDate), "EEEE d MMMM", { locale: it })}
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
              onClick={() => onConfirm(selectedService.id, selectedDate, selectedTime)}
              className="w-full h-12 rounded-xl bg-gradient-hero text-primary-foreground font-semibold mt-6 shadow-elevated hover:opacity-90 transition-opacity"
            >
              Conferma Prenotazione
            </Button>

            <button
              onClick={() => setStep(2)}
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

export default NewBookingPage;
