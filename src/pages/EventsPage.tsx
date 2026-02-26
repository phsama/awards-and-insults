import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Check, HelpCircle, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    setLoading(true);
    const [eventsRes, rsvpsRes] = await Promise.all([
      supabase.from("events").select("*").order("event_date", { ascending: true }),
      supabase.from("event_rsvps").select("*"),
    ]);
    setEvents(eventsRes.data || []);
    setRsvps(rsvpsRes.data || []);
    setLoading(false);
  };

  const handleRsvp = async (eventId: string, status: string) => {
    if (!user) return;
    const existing = rsvps.find((r) => r.event_id === eventId && r.user_id === user.id);
    if (existing) {
      await supabase.from("event_rsvps").update({ status }).eq("id", existing.id);
    } else {
      await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: user.id, status });
    }
    loadEvents();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gradient-gold">Eventos</h1>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum evento agendado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, i) => {
            const eventRsvps = rsvps.filter((r) => r.event_id === event.id);
            const going = eventRsvps.filter((r) => r.status === "going").length;
            const maybe = eventRsvps.filter((r) => r.status === "maybe").length;
            const notGoing = eventRsvps.filter((r) => r.status === "not_going").length;
            const myRsvp = eventRsvps.find((r) => r.user_id === user?.id)?.status;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-card border border-border rounded-xl p-5"
              >
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{event.title}</h3>
                {event.description && <p className="text-sm text-muted-foreground mb-3">{event.description}</p>}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    {format(new Date(event.event_date), "dd MMM yyyy · HH:mm", { locale: ptBR })}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-primary" /> {event.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-primary" /> {going + maybe} interessados
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRsvp(event.id, "going")}
                    className={myRsvp === "going" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}
                  >
                    <Check className="w-4 h-4 mr-1" /> Vou ({going})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRsvp(event.id, "maybe")}
                    className={myRsvp === "maybe" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}
                  >
                    <HelpCircle className="w-4 h-4 mr-1" /> Talvez ({maybe})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRsvp(event.id, "not_going")}
                    className={myRsvp === "not_going" ? "border-destructive bg-destructive/10 text-destructive" : "border-border text-muted-foreground hover:bg-muted"}
                  >
                    <X className="w-4 h-4 mr-1" /> Não ({notGoing})
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
