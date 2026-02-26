import { motion } from "framer-motion";
import { Trophy, Crown, Star, Award } from "lucide-react";

const mockCategories = [
  { name: "Mais Engraçado", winner: "Zé Ninguém", emoji: "😂" },
  { name: "Mais Atrasado", winner: "Maria Sumida", emoji: "⏰" },
  { name: "Melhor Conselheiro", winner: "Guru do Grupo", emoji: "🧠" },
  { name: "Mais Fofoqueiro", winner: "Boca Solta", emoji: "🗣️" },
  { name: "Melhor Cozinheiro", winner: "Chef Desastre", emoji: "👨‍🍳" },
];

const stats = [
  { label: "Categorias", value: "12", icon: Award },
  { label: "Indicações", value: "47", icon: Star },
  { label: "Votos", value: "156", icon: Crown },
  { label: "Fase", value: "Votação", icon: Trophy },
];

export default function AwardsPage() {
  return (
    <div className="h-full flex flex-col bg-gradient-dark p-4 md:p-6 overflow-auto">
      {/* Compact Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-4"
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-2">
          <Trophy className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Temporada {new Date().getFullYear()}</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-gradient-gold leading-tight">
          Motherfucker Awards
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Alguém precisa ganhar isso aqui. Solta o veredito.
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4 max-w-3xl mx-auto w-full">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-gradient-card border border-border rounded-lg p-2.5 md:p-3 text-center"
          >
            <stat.icon className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="font-display text-lg md:text-xl font-bold text-foreground leading-none">{stat.value}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Categories - fills remaining space */}
      <div className="flex-1 max-w-3xl mx-auto w-full min-h-0">
        <h2 className="font-display text-lg font-bold mb-2 text-foreground">
          🏆 Hall da Fama
        </h2>
        <div className="space-y-2">
          {mockCategories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="bg-gradient-card border border-border rounded-lg px-4 py-3 flex items-center gap-3 hover:border-primary/30 transition-colors group"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground">Vencedor: {cat.winner}</p>
              </div>
              <Trophy className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
