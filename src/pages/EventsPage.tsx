import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Check, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockEvents = [
  {
    id: 1,
    title: "Churrasco da Premiação",
    date: "15 Mar 2025",
    location: "Casa do Zé",
    going: 8,
    maybe: 3,
    notGoing: 1,
    description: "Churrasco + cerimônia do Awards. Traga sua cerveja.",
  },
  {
    id: 2,
    title: "Futebol Mensal",
    date: "22 Mar 2025",
    location: "Quadra do bairro",
    going: 10,
    maybe: 4,
    notGoing: 2,
    description: "Pelada clássica. Quem perder paga o açaí.",
  },
  {
    id: 3,
    title: "Bar do Mês",
    date: "29 Mar 2025",
    location: "Boteco Tradição",
    going: 6,
    maybe: 5,
    notGoing: 0,
    description: "Uma cerveja nunca é só uma cerveja.",
  },
];

export default function EventsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gradient-gold">Eventos</h1>
        <Button className="bg-primary text-primary-foreground hover:bg-gold-light">
          <Calendar className="w-4 h-4 mr-2" /> Criar Evento
        </Button>
      </div>

      <div className="space-y-4">
        {mockEvents.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-card border border-border rounded-xl p-5"
          >
            <h3 className="font-display text-xl font-bold text-foreground mb-2">{event.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{event.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-primary" /> {event.date}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-primary" /> {event.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" /> {event.going + event.maybe} interessados
              </span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                <Check className="w-4 h-4 mr-1" /> Vou ({event.going})
              </Button>
              <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:bg-muted">
                <HelpCircle className="w-4 h-4 mr-1" /> Talvez ({event.maybe})
              </Button>
              <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4 mr-1" /> Não ({event.notGoing})
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
