import { Trophy, MessageSquare, PiggyBank, Heart, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileViewProps {
  userId: string;
  isOwn?: boolean;
  onEditClick?: () => void;
  editSection?: React.ReactNode;
}

export default function UserProfileView({ userId, isOwn, onEditClick, editSection }: UserProfileViewProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [nominations, setNominations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [savings, setSavings] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    if (userId) loadAll();
  }, [userId]);

  const loadAll = async () => {
    setLoading(true);
    const [profRes, postsRes, reactionsRes, nomsRes, catsRes, contRes, savRes, ubRes, bRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("posts").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("reactions").select("*"),
      supabase.from("award_nominations").select("*").eq("nominated_user_id", userId),
      supabase.from("award_categories").select("*"),
      supabase.from("contributions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("group_savings").select("*"),
      supabase.from("user_badges").select("*").eq("user_id", userId),
      supabase.from("badges").select("*"),
    ]);
    setProfile(profRes.data);
    setPosts(postsRes.data || []);
    setReactions(reactionsRes.data || []);
    setNominations(nomsRes.data || []);
    setCategories(catsRes.data || []);
    setContributions(contRes.data || []);
    setSavings(savRes.data || []);
    setUserBadges(ubRes.data || []);
    setBadges(bRes.data || []);
    setLoading(false);
  };

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h`;
    return `${Math.floor(mins / 1440)}d`;
  };

  const getCatName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? `${cat.emoji || "🏆"} ${cat.name}` : "Categoria";
  };

  const getSavingsName = (savId: string) => savings.find((s) => s.id === savId)?.name || "Caixinha";

  if (loading) return <p className="text-muted-foreground text-sm text-center py-12">Carregando...</p>;

  const myBadges = userBadges.map((ub) => badges.find((b) => b.id === ub.badge_id)).filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto pt-3">
      {/* Cover */}
      <div className="relative h-48 md:h-72 mx-3 rounded-xl bg-gradient-to-br from-primary/30 to-background overflow-hidden">
        {profile?.cover_url && <img src={profile.cover_url} className="w-full h-full object-cover" alt="Cover" />}
      </div>

      {/* Avatar + Info */}
      <div className="px-6 -mt-20 relative z-10">
        <div className="flex items-end gap-5 mb-3">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-card border-4 border-background flex items-center justify-center text-6xl shadow-gold overflow-hidden shrink-0">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" /> : "👤"}
          </div>

          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">{profile?.aka || profile?.name || "Sem nome"}</h1>
              {isOwn && onEditClick && (
                <button onClick={onEditClick} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {profile?.username ? `@${profile.username}` : "sem username"}
              {profile?.aka && profile?.name ? ` · ${profile.name}` : ""}
            </p>
          </div>
        </div>

        {editSection}

        {profile?.bio && <p className="text-foreground text-sm mb-4">{profile.bio}</p>}

        {/* Badges */}
        {myBadges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {myBadges.map((badge: any) => (
              <span key={badge.id} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full" title={badge.description}>
                {badge.emoji} {badge.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 pb-8">
        <Tabs defaultValue="posts">
          <TabsList className="bg-muted w-full justify-start">
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="awards">Awards ({nominations.length})</TabsTrigger>
            <TabsTrigger value="poupanca">Poupança ({contributions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4">
            {posts.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum post ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => {
                  const postReactions = reactions.filter((r) => r.post_id === post.id);
                  return (
                    <div key={post.id} className="bg-gradient-card border border-border rounded-xl p-4">
                      <p className="text-foreground text-sm mb-2">{post.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {postReactions.length}</span>
                        <span>{timeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="awards" className="mt-4">
            {nominations.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma indicação recebida.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...new Set(nominations.map((n) => n.category_id))].map((catId) => {
                  const count = nominations.filter((n) => n.category_id === catId).length;
                  return (
                    <div key={catId} className="bg-gradient-card border border-border rounded-xl p-4 flex items-center gap-3">
                      <Award className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{getCatName(catId)}</p>
                        <p className="text-xs text-muted-foreground">{count} indicação{count > 1 ? "ões" : ""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="poupanca" className="mt-4">
            {contributions.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <PiggyBank className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum depósito registrado.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contributions.map((c) => (
                  <div key={c.id} className="bg-gradient-card border border-border rounded-xl p-4 flex items-center gap-3">
                    <PiggyBank className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">R$ {Number(c.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{getSavingsName(c.savings_id)}{c.note ? ` · ${c.note}` : ""}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
