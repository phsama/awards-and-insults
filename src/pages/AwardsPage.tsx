import { motion } from "framer-motion";
import { Trophy, Crown, Star, Award } from "lucide-react";

const mockCategories = [
  { name: "Mais Engraçado", winner: "Zé Ninguém", emoji: "😂" },
  { name: "Mais Atrasado", winner: "Maria Sumida", emoji: "⏰" },
  { name: "Melhor Conselheiro", winner: "Guru do Grupo", emoji: "🧠" },
  { name: "Mais Fofoqueiro", winner: "Boca Solta", emoji: "🗣️" },
  { name: "Melhor Cozinheiro", winner: "Chef Desastre", emoji: "👨‍🍳" },
];

export default function AwardsPage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero */}
      <div className="relative overflow-hidden py-16 px-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/20 blur-[150px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Temporada 2024</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 text-gradient-gold">
            Motherfucker Awards
          </h1>
          <p className="text-muted-foreground text-lg">
            Alguém precisa ganhar isso aqui. Solta o veredito.
          </p>
        </motion.div>
      </div>

      {/* Status */}
      <div className="px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Categorias", value: "12", icon: Award },
            { label: "Indicações", value: "47", icon: Star },
            { label: "Votos", value: "156", icon: Crown },
            { label: "Fase", value: "Votação", icon: Trophy },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-gradient-card border border-border rounded-xl p-4 text-center"
            >
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Categories */}
        <h2 className="font-display text-2xl font-bold mb-6 text-foreground">
          🏆 Hall da Fama
        </h2>
        <div className="space-y-4 pb-8">
          {mockCategories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-gradient-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors group"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-muted-foreground">Vencedor: {cat.winner}</p>
              </div>
              <Trophy className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
