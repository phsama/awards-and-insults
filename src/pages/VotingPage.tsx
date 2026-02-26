import { motion } from "framer-motion";
import { Vote, Trophy, Check, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function VotingPage() {
  const { user } = useAuth();
  const [season, setSeason] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [nominations, setNominations] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleVote = async (categoryId: string, votedFor: string) => {
    if (!user) return;
    const existing = votes.find((v) => v.category_id === categoryId && v.voted_by === user.id);
    if (existing) { toast.error("Você já votou nesta categoria"); return; }

    const { error } = await supabase.from("award_votes").insert({
      category_id: categoryId,
      voted_by: user.id,
      voted_for: votedFor,
    });
    if (error) toast.error("Erro: " + error.message);
    else { toast.success("Voto registrado! 🗳️"); loadData(); }
  };

  const getProfileName = (uid: string) => profiles.find((p) => p.user_id === uid)?.name || "Anônimo";
  const getProfile = (uid: string) => profiles.find((p) => p.user_id === uid);

  const isVotingOpen = season?.phase === "voting";
  const isResults = season?.phase === "results";

  const totalVoted = categories.filter(
    (cat) => votes.some((v) => v.category_id === cat.id && v.voted_by === user?.id)
  ).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 overflow-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-2">
          <Vote className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">
            {season ? `Temporada ${season.year}` : ""}
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold text-gradient-gold">Votação</h1>
        {isVotingOpen && (
          <p className="text-muted-foreground text-sm mt-1">
            Você votou em {totalVoted} de {categories.length} categorias
          </p>
        )}
        {!isVotingOpen && !isResults && (
          <p className="text-muted-foreground text-sm mt-1">A votação ainda não está aberta.</p>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>
      ) : !isVotingOpen && !isResults ? (
        <div className="text-center py-16">
          <Vote className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            {season?.phase === "nominations" ? "Aguarde as indicações terminarem para votar." : "Nenhuma votação ativa."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat, i) => {
            const catNoms = nominations.filter((n) => n.category_id === cat.id);
            const catVotes = votes.filter((v) => v.category_id === cat.id);
            const myVote = catVotes.find((v) => v.voted_by === user?.id);

            // Get unique nominees
            const uniqueNominees = [...new Set(catNoms.map((n) => n.nominated_user_id))];
            const nomCounts: Record<string, number> = {};
            catNoms.forEach((n) => { nomCounts[n.nominated_user_id] = (nomCounts[n.nominated_user_id] || 0) + 1; });

            // Vote counts for results
            const voteCounts: Record<string, number> = {};
            catVotes.forEach((v) => { voteCounts[v.voted_for] = (voteCounts[v.voted_for] || 0) + 1; });

            const sortedNominees = uniqueNominees
              .map((uid) => ({
                uid,
                name: getProfileName(uid),
                profile: getProfile(uid),
                noms: nomCounts[uid] || 0,
                voteCount: voteCounts[uid] || 0,
              }))
              .sort((a, b) => isResults ? b.voteCount - a.voteCount : b.noms - a.noms);

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-card border border-border rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{cat.emoji || "🏆"}</span>
                  <div>
                    <h3 className="font-display font-bold text-foreground">{cat.name}</h3>
                    {(cat as any).description && (
                      <p className="text-xs text-muted-foreground">{(cat as any).description}</p>
                    )}
                  </div>
                  {myVote && (
                    <div className="ml-auto flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" /> Votado
                    </div>
                  )}
                </div>

                {uniqueNominees.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum indicado nesta categoria.</p>
                ) : (
                  <div className="space-y-2">
                    {sortedNominees.map(({ uid, name, profile, noms, voteCount }, idx) => {
                      const isMyVote = myVote?.voted_for === uid;
                      const isWinner = isResults && idx === 0;
                      const totalCatVotes = catVotes.length || 1;
                      const pct = Math.round((voteCount / totalCatVotes) * 100);

                      return (
                        <div
                          key={uid}
                          className={`relative flex items-center gap-3 p-3 rounded-lg transition-all ${
                            isMyVote
                              ? "bg-primary/10 border border-primary/30"
                              : isWinner
                              ? "bg-primary/5 border border-primary/20"
                              : "bg-muted/50 hover:bg-muted"
                          } ${isVotingOpen && !myVote ? "cursor-pointer" : ""}`}
                          onClick={() => {
                            if (isVotingOpen && !myVote) handleVote(cat.id, uid);
                          }}
                        >
                          {/* Result bar background */}
                          {isResults && voteCount > 0 && (
                            <div
                              className="absolute inset-0 bg-primary/5 rounded-lg"
                              style={{ width: `${pct}%` }}
                            />
                          )}

                          <div className="relative flex items-center gap-3 flex-1 z-10">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm overflow-hidden shrink-0 ring-2 ring-border">
                              {profile?.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full object-cover" />
                              ) : "👤"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                {isWinner && <Crown className="w-4 h-4 text-primary" />}
                                {name}
                                {profile?.aka && <span className="text-xs text-muted-foreground">({profile.aka})</span>}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {isResults ? `${voteCount} voto${voteCount !== 1 ? "s" : ""} (${pct}%)` : `${noms} indicação${noms > 1 ? "ões" : ""}`}
                              </p>
                            </div>
                            {isVotingOpen && !myVote && (
                              <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 h-8 text-xs">
                                Votar
                              </Button>
                            )}
                            {isMyVote && <Check className="w-5 h-5 text-primary shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
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
