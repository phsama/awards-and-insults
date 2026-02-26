import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Trophy, Plus, Play, Eye, Crown, Ticket, Award, Copy, Check,
  ChevronRight, Users, Settings, Trash2, Medal
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminPage() {
  const { user, isLider } = useAuth();
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [nominations, setNominations] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Badge assignment
  const [badgeUserId, setBadgeUserId] = useState("");
  const [badgeBadgeId, setBadgeBadgeId] = useState("");

  // Forms
  const [newSeasonYear, setNewSeasonYear] = useState(new Date().getFullYear());
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🏆");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [newInviteCode, setNewInviteCode] = useState("");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [seasonsRes, catsRes, nomsRes, profilesRes, invitesRes, badgesRes, ubRes, rolesRes] = await Promise.all([
      supabase.from("award_seasons").select("*").order("year", { ascending: false }),
      supabase.from("award_categories").select("*"),
      supabase.from("award_nominations").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("invites").select("*").order("created_at", { ascending: false }),
      supabase.from("badges").select("*"),
      supabase.from("user_badges").select("*"),
      supabase.from("user_roles").select("*"),
    ]);
    setSeasons(seasonsRes.data || []);
    setCategories(catsRes.data || []);
    setNominations(nomsRes.data || []);
    setProfiles(profilesRes.data || []);
    setInvites(invitesRes.data || []);
    setBadges(badgesRes.data || []);
    setUserBadges(ubRes.data || []);
    setUserRoles(rolesRes.data || []);
    if (seasonsRes.data?.[0]) setSelectedSeason(seasonsRes.data[0].id);
    setLoading(false);
  };

  const createSeason = async () => {
    const { error } = await supabase.from("award_seasons").insert({
      year: newSeasonYear,
      created_by: user!.id,
      phase: "setup",
    });
    if (error) toast.error("Erro: " + error.message);
    else { toast.success(`Temporada ${newSeasonYear} criada!`); loadAll(); }
  };

  const updatePhase = async (seasonId: string, phase: string) => {
    const { error } = await supabase.from("award_seasons").update({ phase }).eq("id", seasonId);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success(`Fase atualizada para: ${phase}`); loadAll(); }
  };

  const createCategory = async () => {
    if (!newCatName.trim() || !selectedSeason) return;
    const { error } = await supabase.from("award_categories").insert({
      name: newCatName.trim(),
      emoji: newCatEmoji || "🏆",
      season_id: selectedSeason,
      description: newCatDesc.trim() || null,
    } as any);
    if (error) toast.error("Erro: " + error.message);
    else { setNewCatName(""); setNewCatDesc(""); toast.success("Categoria criada!"); loadAll(); }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("award_categories").delete().eq("id", id);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success("Categoria removida"); loadAll(); }
  };

  const createInvite = async () => {
    const code = newInviteCode.trim() || `MF-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from("invites").insert({
      code,
      created_by: user!.id,
    });
    if (error) toast.error("Erro: " + error.message);
    else { setNewInviteCode(""); toast.success(`Convite criado: ${code}`); loadAll(); }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  const assignBadge = async () => {
    if (!badgeUserId || !badgeBadgeId) return;
    const { error } = await supabase.from("user_badges").insert({
      user_id: badgeUserId,
      badge_id: badgeBadgeId,
      assigned_by: user!.id,
    } as any);
    if (error) {
      if (error.message.includes("duplicate")) toast.error("Já possui essa badge");
      else toast.error("Erro: " + error.message);
    } else {
      toast.success("Badge atribuída!");
      setBadgeUserId(""); setBadgeBadgeId("");
      loadAll();
    }
  };

  const removeBadge = async (id: string) => {
    await supabase.from("user_badges").delete().eq("id", id);
    toast.success("Badge removida");
    loadAll();
  };

  const changeRole = async (targetUserId: string, newRole: "lider" | "porta_voz" | "vagabundo") => {
    const existing = userRoles.find((r) => r.user_id === targetUserId);
    if (existing) {
      const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("id", existing.id);
      if (error) toast.error("Erro: " + error.message);
      else { toast.success("Cargo atualizado!"); loadAll(); }
    } else {
      const { error } = await supabase.from("user_roles").insert([{ user_id: targetUserId, role: newRole }]);
      if (error) toast.error("Erro: " + error.message);
      else { toast.success("Cargo atribuído!"); loadAll(); }
    }
  };

  const getUserRole = (uid: string) => userRoles.find((r) => r.user_id === uid)?.role || "vagabundo";

  const getProfileName = (userId: string) => profiles.find((p) => p.user_id === userId)?.name || "Anônimo";

  const phaseLabels: Record<string, string> = {
    setup: "Preparação",
    nominations: "Indicações Abertas",
    voting: "Votação Aberta",
    results: "Resultado Publicado",
  };

  const phaseOrder = ["setup", "nominations", "voting", "results"];

  if (!isLider) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Acesso restrito ao Líder.</p>
      </div>
    );
  }

  if (loading) return <p className="text-muted-foreground text-sm text-center py-12">Carregando...</p>;

  const currentSeason = seasons.find((s) => s.id === selectedSeason);
  const seasonCats = categories.filter((c) => c.season_id === selectedSeason);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 overflow-auto">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="font-display text-3xl font-bold text-gradient-gold">Painel do Líder</h1>
      </div>

      {/* ===== TEMPORADAS ===== */}
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" /> Temporadas
        </h2>

        <div className="flex gap-2 mb-4">
          <Input
            type="number"
            value={newSeasonYear}
            onChange={(e) => setNewSeasonYear(Number(e.target.value))}
            className="w-28 bg-muted border-border"
          />
          <Button onClick={createSeason} className="bg-primary text-primary-foreground hover:bg-gold-light">
            <Plus className="w-4 h-4 mr-1" /> Nova Temporada
          </Button>
        </div>

        <div className="space-y-3">
          {seasons.map((season) => (
            <motion.div
              key={season.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`bg-gradient-card border rounded-xl p-4 cursor-pointer transition-all ${
                selectedSeason === season.id ? "border-primary shadow-gold" : "border-border hover:border-primary/30"
              }`}
              onClick={() => setSelectedSeason(season.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-display font-bold text-foreground">Temporada {season.year}</h3>
                    <p className="text-xs text-muted-foreground">{phaseLabels[season.phase] || season.phase}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {phaseOrder.map((phase) => (
                    <button
                      key={phase}
                      onClick={(e) => { e.stopPropagation(); updatePhase(season.id, phase); }}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        season.phase === phase
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                      title={phaseLabels[phase]}
                    >
                      {phase === "setup" ? "🔧" : phase === "nominations" ? "📝" : phase === "voting" ? "🗳️" : "🏆"}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIAS ===== */}
      {selectedSeason && (
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Categorias — {currentSeason?.year}
          </h2>

          <div className="flex gap-2 mb-4">
            <Input
              value={newCatEmoji}
              onChange={(e) => setNewCatEmoji(e.target.value)}
              className="w-16 bg-muted border-border text-center text-lg"
              maxLength={2}
            />
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nome da categoria"
              className="flex-1 bg-muted border-border"
            />
            <Input
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Descrição (opcional)"
              className="flex-1 bg-muted border-border"
            />
            <Button onClick={createCategory} className="bg-primary text-primary-foreground hover:bg-gold-light">
              <Plus className="w-4 h-4 mr-1" /> Criar
            </Button>
          </div>

          {seasonCats.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">Nenhuma categoria ainda.</p>
          ) : (
            <div className="space-y-2">
              {seasonCats.map((cat) => {
                const catNoms = nominations.filter((n) => n.category_id === cat.id);
                return (
                  <div
                    key={cat.id}
                    className="bg-gradient-card border border-border rounded-lg px-4 py-3 flex items-center gap-3"
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">{cat.name}</p>
                      {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                      <p className="text-xs text-muted-foreground">{catNoms.length} indicações</p>
                    </div>
                    {catNoms.length > 0 && (
                      <div className="hidden sm:flex gap-1 flex-wrap max-w-[200px]">
                        {[...new Set(catNoms.map((n) => n.nominated_user_id))].map((uid) => (
                          <span key={uid as string} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            {getProfileName(uid as string)}
                          </span>
                        ))}
                      </div>
                    )}
                    <button onClick={() => deleteCategory(cat.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ===== CONVITES ===== */}
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" /> Convites
        </h2>

        <div className="flex gap-2 mb-4">
          <Input
            value={newInviteCode}
            onChange={(e) => setNewInviteCode(e.target.value)}
            placeholder="Código (deixe vazio para gerar)"
            className="flex-1 bg-muted border-border"
          />
          <Button onClick={createInvite} className="bg-primary text-primary-foreground hover:bg-gold-light">
            <Plus className="w-4 h-4 mr-1" /> Criar
          </Button>
        </div>

        <div className="space-y-2">
          {invites.map((inv) => (
            <div
              key={inv.id}
              className="bg-gradient-card border border-border rounded-lg px-4 py-3 flex items-center gap-3"
            >
              <Ticket className={`w-4 h-4 ${inv.used ? "text-muted-foreground" : "text-primary"}`} />
              <code className={`flex-1 text-sm font-mono ${inv.used ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {inv.code}
              </code>
              {inv.used ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="w-3 h-3" /> Usado
                </span>
              ) : (
                <button onClick={() => copyCode(inv.code)} className="text-muted-foreground hover:text-primary transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== BADGES ===== */}
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-primary" /> Badges
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {badges.map((b) => (
            <span key={b.id} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full" title={b.description}>
              {b.emoji} {b.name}
            </span>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <Select value={badgeUserId} onValueChange={setBadgeUserId}>
            <SelectTrigger className="flex-1 bg-muted border-border"><SelectValue placeholder="Membro" /></SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.user_id} value={p.user_id}>{p.name || "Sem nome"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={badgeBadgeId} onValueChange={setBadgeBadgeId}>
            <SelectTrigger className="flex-1 bg-muted border-border"><SelectValue placeholder="Badge" /></SelectTrigger>
            <SelectContent>
              {badges.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.emoji} {b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={assignBadge} className="bg-primary text-primary-foreground hover:bg-gold-light">
            <Plus className="w-4 h-4 mr-1" /> Dar
          </Button>
        </div>

        {userBadges.length > 0 && (
          <div className="space-y-2">
            {userBadges.map((ub) => {
              const badge = badges.find((b) => b.id === ub.badge_id);
              return (
                <div key={ub.id} className="bg-gradient-card border border-border rounded-lg px-4 py-2 flex items-center gap-3">
                  <span className="text-lg">{badge?.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{badge?.name}</p>
                    <p className="text-xs text-muted-foreground">→ {getProfileName(ub.user_id)}</p>
                  </div>
                  <button onClick={() => removeBadge(ub.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== MEMBROS ===== */}
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Membros
        </h2>
        <div className="space-y-2">
          {profiles.map((p) => {
            const role = getUserRole(p.user_id);
            const roleLabels: Record<string, string> = { lider: "👑 Líder", porta_voz: "📢 Porta-voz", vagabundo: "😴 Vagabundo" };
            const roleColors: Record<string, string> = { lider: "text-primary", porta_voz: "text-[hsl(200,70%,50%)]", vagabundo: "text-muted-foreground" };
            return (
              <div
                key={p.id}
                className="bg-gradient-card border border-border rounded-lg px-4 py-3 flex items-center gap-3"
              >
                <div
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/perfil/${p.user_id}`)}
                >
                  {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : "👤"}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/perfil/${p.user_id}`)}>
                  <p className="text-sm font-semibold text-foreground">{p.name || "Sem nome"}</p>
                  <p className="text-xs text-muted-foreground">{p.username ? `@${p.username}` : ""} {p.aka ? `· AKA: ${p.aka}` : ""}</p>
                </div>
                <Select
                  value={role}
                  onValueChange={(val) => changeRole(p.user_id, val as "lider" | "porta_voz" | "vagabundo")}
                >
                  <SelectTrigger className={`w-[140px] bg-muted border-border text-xs h-8 ${roleColors[role]}`}>
                    <SelectValue>{roleLabels[role]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lider">👑 Líder</SelectItem>
                    <SelectItem value="porta_voz">📢 Porta-voz</SelectItem>
                    <SelectItem value="vagabundo">😴 Vagabundo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
