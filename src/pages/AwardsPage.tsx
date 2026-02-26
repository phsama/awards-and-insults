import { motion } from "framer-motion";
import { Trophy, Crown, Star, Award, UserPlus, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AwardsPage() {
  const { user } = useAuth();
  const [season, setSeason] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [nominations, setNominations] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [nominatingCat, setNominatingCat] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: seasons } = await supabase
      .from("award_seasons").select("*").order("year", { ascending: false }).limit(1);
    const currentSeason = seasons?.[0] || null;
    setSeason(currentSeason);

    if (currentSeason) {
      const [catsRes, nomsRes, votesRes, profRes] = await Promise.all([
        supabase.from("award_categories").select("*").eq("season_id", currentSeason.id),
        supabase.from("award_nominations").select("*"),
        supabase.from("award_votes").select("*"),
        supabase.from("profiles").select("*"),
      ]);
      setCategories(catsRes.data || []);
      setNominations(nomsRes.data || []);
      setVotes(votesRes.data || []);
      setProfiles(profRes.data || []);
    }
    setLoading(false);
  };

  const nominate = async (categoryId: string) => {
    if (!selectedUser || !user) return;
    // Check if already nominated this user in this category
    const exists = nominations.find(
      (n) => n.category_id === categoryId && n.nominated_by === user.id && n.nominated_user_id === selectedUser
    );
    if (exists) { toast.error("Você já indicou essa pessoa nesta categoria"); return; }

    const { error } = await supabase.from("award_nominations").insert({
      category_id: categoryId,
      nominated_by: user.id,
      nominated_user_id: selectedUser,
    });
    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success("Indicação registrada!");
      setNominatingCat(null);
      setSelectedUser("");
      loadData();
    }
  };

  const getProfileName = (uid: string) => profiles.find((p) => p.user_id === uid)?.name || "Anônimo";
  const getProfile = (uid: string) => profiles.find((p) => p.user_id === uid);

  const phaseLabel: Record<string, string> = {
    setup: "Preparação",
    nominations: "Indicações Abertas",
    voting: "Votação Aberta",
    results: "Resultado",
  };

  const stats = [
    { label: "Categorias", value: categories.length, icon: Award },
    { label: "Indicações", value: nominations.length, icon: Star },
    { label: "Votos", value: votes.length, icon: Crown },
    { label: "Fase", value: season ? phaseLabel[season.phase] || season.phase : "—", icon: Trophy },
  ];

  const isNominationsOpen = season?.phase === "nominations";

  return (
    <div className="h-full flex flex-col bg-gradient-dark p-4 md:p-6 overflow-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-4">
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
          {isNominationsOpen ? "🔥 Indicações abertas — indique os vagabundos!" : "Alguém precisa ganhar isso aqui."}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4 max-w-3xl mx-auto w-full">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-gradient-card border border-border rounded-lg p-2.5 md:p-3 text-center">
            <stat.icon className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="font-display text-lg md:text-xl font-bold text-foreground leading-none">{stat.value}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Categories */}
      <div className="flex-1 max-w-3xl mx-auto w-full min-h-0">
        <h2 className="font-display text-lg font-bold mb-3 text-foreground">
          🏆 {season?.phase === "results" ? "Hall da Fama" : "Categorias"}
        </h2>

        {loading ? (
          <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma categoria ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((cat, i) => {
              const catNoms = nominations.filter((n) => n.category_id === cat.id);
              const catVotes = votes.filter((v) => v.category_id === cat.id);
              const isExpanded = expandedCat === cat.id;
              const isNominating = nominatingCat === cat.id;

              // Get unique nominated users with count
              const nomCounts: Record<string, number> = {};
              catNoms.forEach((n) => { nomCounts[n.nominated_user_id] = (nomCounts[n.nominated_user_id] || 0) + 1; });
              const nominatedUsers = Object.entries(nomCounts)
                .map(([uid, count]) => ({ uid, count, name: getProfileName(uid), profile: getProfile(uid) }))
                .sort((a, b) => b.count - a.count);

              // For results phase - vote counts
              const voteCounts: Record<string, number> = {};
              catVotes.forEach((v) => { voteCounts[v.voted_for] = (voteCounts[v.voted_for] || 0) + 1; });
              const voteRanking = Object.entries(voteCounts)
                .map(([uid, count]) => ({ uid, count, name: getProfileName(uid), profile: getProfile(uid) }))
                .sort((a, b) => b.count - a.count);

              const myNomination = catNoms.find((n) => n.nominated_by === user?.id);

              return (
                <motion.div key={cat.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                  className="bg-gradient-card border border-border rounded-xl overflow-hidden">
                  <div
                    className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                  >
                    <span className="text-2xl">{cat.emoji || "🏆"}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-sm text-foreground">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {(cat as any).description || `${catNoms.length} indicações · ${catVotes.length} votos`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isNominationsOpen && !myNomination && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Indicar</span>
                      )}
                      {myNomination && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 border-t border-border pt-3">
                      {/* Nominated users */}
                      {nominatedUsers.length > 0 ? (
                        <div className="space-y-2 mb-3">
                          {nominatedUsers.map(({ uid, count, name, profile }, idx) => (
                            <div key={uid} className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs overflow-hidden shrink-0">
                                {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : "👤"}
                              </div>
                              <span className="text-foreground flex-1">
                                {idx === 0 && season?.phase === "results" ? "🥇 " : ""}
                                {name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {season?.phase === "results"
                                  ? `${voteCounts[uid] || 0} votos`
                                  : `${count} indicação${count > 1 ? "ões" : ""}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mb-3">Nenhuma indicação ainda.</p>
                      )}

                      {/* Nominate action */}
                      {isNominationsOpen && (
                        <>
                          {isNominating ? (
                            <div className="flex gap-2">
                              <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger className="flex-1 bg-muted border-border text-sm h-9">
                                  <SelectValue placeholder="Escolha alguém..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {profiles.filter((p) => p.user_id !== user?.id).map((p) => (
                                    <SelectItem key={p.user_id} value={p.user_id}>
                                      {p.name}{p.aka ? ` (${p.aka})` : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button size="sm" onClick={() => nominate(cat.id)} className="bg-primary text-primary-foreground hover:bg-gold-light h-9">
                                <UserPlus className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm" variant="outline"
                              className="border-primary/30 text-primary hover:bg-primary/10 w-full"
                              onClick={(e) => { e.stopPropagation(); setNominatingCat(cat.id); setSelectedUser(""); }}
                            >
                              <UserPlus className="w-4 h-4 mr-1.5" /> Indicar alguém
                            </Button>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
