import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Check, HelpCircle, X, Plus, ListChecks, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function EventsPage() {
  const { user, isLider } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Create event form
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // Checklist add
  const [checklistInput, setChecklistInput] = useState<Record<string, string>>({});

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    setLoading(true);
    const [eventsRes, rsvpsRes, checkRes, profRes] = await Promise.all([
      supabase.from("events").select("*").order("event_date", { ascending: true }),
      supabase.from("event_rsvps").select("*"),
      supabase.from("event_checklist_items").select("*").order("created_at", { ascending: true }),
      supabase.from("profiles").select("*"),
    ]);
    setEvents(eventsRes.data || []);
    setRsvps(rsvpsRes.data || []);
    setChecklist(checkRes.data || []);
    const pMap: Record<string, any> = {};
    (profRes.data || []).forEach((p: any) => { pMap[p.user_id] = p; });
    setProfiles(pMap);
    setLoading(false);
  };

  const createEvent = async () => {
    if (!newTitle.trim() || !newDate) { toast.error("Título e data obrigatórios"); return; }
    const { error } = await supabase.from("events").insert({
      title: newTitle.trim(),
      description: newDesc.trim() || null,
      event_date: new Date(newDate).toISOString(),
      location: newLocation.trim() || null,
      user_id: user!.id,
    });
    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success("Evento criado!");
      setNewTitle(""); setNewDesc(""); setNewDate(""); setNewLocation("");
      setCreateOpen(false);
      loadEvents();
    }
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

  const addChecklistItem = async (eventId: string) => {
    const label = checklistInput[eventId]?.trim();
    if (!label) return;
    const { error } = await supabase.from("event_checklist_items").insert({ event_id: eventId, label });
    if (error) toast.error("Erro: " + error.message);
    else {
      setChecklistInput((p) => ({ ...p, [eventId]: "" }));
      loadEvents();
    }
  };

  const toggleCheck = async (item: any) => {
    const newChecked = !item.checked;
    await supabase.from("event_checklist_items").update({
      checked: newChecked,
      checked_by: newChecked ? user!.id : null,
    }).eq("id", item.id);
    loadEvents();
  };

  const deleteCheckItem = async (id: string) => {
    await supabase.from("event_checklist_items").delete().eq("id", id);
    loadEvents();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gradient-gold">Eventos</h1>
        {isLider && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-gold-light">
                <Plus className="w-4 h-4 mr-1" /> Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-foreground">Criar Evento</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título" className="bg-muted border-border" />
                <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descrição (opcional)" className="bg-muted border-border" />
                <Input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="bg-muted border-border" />
                <Input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Local (opcional)" className="bg-muted border-border" />
                <Button onClick={createEvent} className="w-full bg-primary text-primary-foreground hover:bg-gold-light">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
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
            const eventChecklist = checklist.filter((c) => c.event_id === event.id);

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

                <div className="flex gap-2 mb-4">
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

                {/* Checklist */}
                {(eventChecklist.length > 0 || isLider) && (
                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-primary" /> Checklist
                    </h4>
                    <div className="space-y-2">
                      {eventChecklist.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 group">
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleCheck(item)}
                          />
                          <span className={`text-sm flex-1 ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {item.label}
                          </span>
                          {item.checked && item.checked_by && (
                            <span className="text-xs text-muted-foreground">
                              {profiles[item.checked_by]?.name || ""}
                            </span>
                          )}
                          {isLider && (
                            <button onClick={() => deleteCheckItem(item.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {isLider && (
                      <div className="flex gap-2 mt-3">
                        <Input
                          value={checklistInput[event.id] || ""}
                          onChange={(e) => setChecklistInput((p) => ({ ...p, [event.id]: e.target.value }))}
                          placeholder="Novo item..."
                          className="bg-muted border-border text-sm h-8"
                          onKeyDown={(e) => e.key === "Enter" && addChecklistItem(event.id)}
                        />
                        <Button size="sm" onClick={() => addChecklistItem(event.id)} className="bg-primary text-primary-foreground hover:bg-gold-light h-8">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
