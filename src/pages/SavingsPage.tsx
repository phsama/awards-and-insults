import { motion } from "framer-motion";
import { PiggyBank, Target, TrendingUp, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const groupSavings = {
  name: "Caixinha do Grupo",
  goal: 5000,
  current: 2350,
  contributions: [
    { name: "Zé Ninguém", amount: 450 },
    { name: "Maria Sumida", amount: 380 },
    { name: "Guru do Grupo", amount: 520 },
    { name: "Chef Desastre", amount: 400 },
    { name: "Boca Solta", amount: 600 },
  ],
};

const personalGoals = [
  { name: "Viagem do grupo", goal: 2000, current: 850, emoji: "✈️" },
  { name: "Presente pro aniversariante", goal: 300, current: 300, emoji: "🎁" },
  { name: "Ingresso do show", goal: 500, current: 120, emoji: "🎵" },
];

export default function SavingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-6 text-gradient-gold">Poupança</h1>

      {/* Group savings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-card border border-border rounded-xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">{groupSavings.name}</h2>
            <p className="text-sm text-muted-foreground">
              R$ {groupSavings.current.toLocaleString()} de R$ {groupSavings.goal.toLocaleString()}
            </p>
          </div>
        </div>

        <Progress value={(groupSavings.current / groupSavings.goal) * 100} className="h-3 mb-4" />

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {Math.round((groupSavings.current / groupSavings.goal) * 100)}% da meta
          </span>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-gold-light">
            <Plus className="w-4 h-4 mr-1" /> Contribuir
          </Button>
        </div>

        {/* Ranking */}
        <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Ranking de contribuições
        </h3>
        <div className="space-y-2">
          {groupSavings.contributions
            .sort((a, b) => b.amount - a.amount)
            .map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <span className="text-foreground">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {c.name}
                </span>
                <span className="text-primary font-semibold">R$ {c.amount}</span>
              </div>
            ))}
        </div>
      </motion.div>

      {/* Personal goals */}
      <h2 className="font-display text-xl font-bold mb-4 text-foreground flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" /> Metas Individuais
      </h2>
      <div className="space-y-3">
        {personalGoals.map((goal, i) => (
          <motion.div
            key={goal.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-foreground font-medium text-sm">
                {goal.emoji} {goal.name}
              </span>
              <span className="text-xs text-muted-foreground">
                R$ {goal.current} / R$ {goal.goal}
              </span>
            </div>
            <Progress value={(goal.current / goal.goal) * 100} className="h-2" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
