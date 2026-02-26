import { motion } from "framer-motion";
import { Trophy, Crown, Star, Award, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function AwardsPage() {
  const [season, setSeason] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [nominations, setNominations] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Get latest season
    const { data: seasons } = await supabase
      .from("award_seasons")
      .select("*")
      .order("year", { ascending: false })
      .limit(1);

    const currentSeason = seasons?.[0] || null;
    setSeason(currentSeason);

    if (currentSeason) {
      const [catsRes, nomsRes, votesRes] = await Promise.all([
        supabase.from("award_categories").select("*").eq("season_id", currentSeason.id),
        supabase.from("award_nominations").select("*"),
        supabase.from("award_votes").select("*"),
      ]);
      setCategories(catsRes.data || []);
      setNominations(nomsRes.data || []);
      setVotes(votesRes.data || []);
    }
    setLoading(false);
  };

  const phaseLabel: Record<string, string> = {
    setup: "Preparação",
    nominations: "Indicações",
    voting: "Votação",
    results: "Resultado",
  };

  const stats = [
    { label: "Categorias", value: categories.length, icon: Award },
    { label: "Indicações", value: nominations.length, icon: Star },
    { label: "Votos", value: votes.length, icon: Crown },
    { label: "Fase", value: season ? phaseLabel[season.phase] || season.phase : "—", icon: Trophy },
  ];

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
          <span className="text-xs font-medium text-primary">
            {season ? `Temporada ${season.year}` : "Sem temporada"}
          </span>
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

      {/* Categories */}
      <div className="flex-1 max-w-3xl mx-auto w-full min-h-0">
        <h2 className="font-display text-lg font-bold mb-2 text-foreground">
          🏆 {season?.phase === "results" ? "Hall da Fama" : "Categorias"}
        </h2>

        {loading ? (
          <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma categoria ainda.</p>
            <p className="text-muted-foreground text-xs mt-1">O Líder precisa criar uma temporada e categorias.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((cat, i) => {
              const catNoms = nominations.filter((n) => n.category_id === cat.id);
              const catVotes = votes.filter((v) => v.category_id === cat.id);
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="bg-gradient-card border border-border rounded-lg px-4 py-3 flex items-center gap-3 hover:border-primary/30 transition-colors group"
                >
                  <span className="text-2xl">{cat.emoji || "🏆"}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {catNoms.length} indicações · {catVotes.length} votos
                    </p>
                  </div>
                  <Trophy className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
