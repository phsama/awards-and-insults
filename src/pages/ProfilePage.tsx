import { Camera, Pencil, Save, X, Trophy, MessageSquare, PiggyBank, Heart, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import UserProfileView from "@/components/profile/UserProfileView";

export default function ProfilePage() {
  const { user } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const targetUserId = userId || user?.id;
  const isOwn = !userId || userId === user?.id;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [aka, setAka] = useState("");
  const [bio, setBio] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOwn && user) loadProfile();
  }, [user, isOwn]);

  const loadProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
    setProfile(data);
    if (data) { setName(data.name || ""); setUsername(data.username || ""); setAka(data.aka || ""); setBio(data.bio || ""); }
  };

  const uploadImage = async (file: File, type: "avatar" | "cover"): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${type}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { cacheControl: "3600", upsert: true });
    if (error) { toast.error("Erro no upload: " + error.message); return null; }
    return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setSaving(true);
    const url = await uploadImage(file, "avatar");
    if (url) { await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user!.id); toast.success("Avatar atualizado!"); loadProfile(); }
    setSaving(false);
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setSaving(true);
    const url = await uploadImage(file, "cover");
    if (url) { await supabase.from("profiles").update({ cover_url: url }).eq("user_id", user!.id); toast.success("Capa atualizada!"); loadProfile(); }
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: name.trim(), username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ""), aka: aka.trim(), bio: bio.trim(),
    }).eq("user_id", user!.id);
    if (error) toast.error("Erro ao salvar: " + error.message);
    else { toast.success("Perfil atualizado!"); setEditing(false); loadProfile(); }
    setSaving(false);
  };

  if (!targetUserId) return null;

  // Other user's profile - read-only
  if (!isOwn) return <UserProfileView userId={targetUserId} />;

  // Own profile with edit capabilities
  return (
    <div className="relative">
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />

      <div className="max-w-3xl mx-auto pt-3">
        <div
          className="relative h-48 md:h-72 mx-3 rounded-xl bg-gradient-to-br from-primary/30 to-background overflow-hidden group cursor-pointer"
          onClick={() => coverInputRef.current?.click()}
        >
          {profile?.cover_url && <img src={profile.cover_url} className="w-full h-full object-cover" alt="Cover" />}
          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors flex items-center justify-center">
            <Camera className="w-8 h-8 text-foreground opacity-0 group-hover:opacity-80 transition-opacity" />
          </div>
        </div>

        <div className="px-6 -mt-20 relative z-10">
          <div className="flex items-end gap-5 mb-3">
            <div
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-card border-4 border-background flex items-center justify-center text-6xl shadow-gold overflow-hidden cursor-pointer group shrink-0"
              onClick={() => avatarInputRef.current?.click()}
            >
              {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" /> : "👤"}
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/50 transition-colors flex items-center justify-center">
                <Camera className="w-6 h-6 text-foreground opacity-0 group-hover:opacity-80 transition-opacity" />
              </div>
            </div>

            {editing ? (
              <div className="flex-1 pb-1 space-y-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="bg-muted border-border text-lg font-display font-bold" />
                <div className="flex gap-2">
                  <div className="flex items-center bg-muted border border-border rounded-md px-2">
                    <span className="text-muted-foreground text-sm">@</span>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className="bg-transparent border-none text-sm p-1" />
                  </div>
                  <Input value={aka} onChange={(e) => setAka(e.target.value)} placeholder="AKA (apelido)" className="bg-muted border-border text-sm" />
                </div>
              </div>
            ) : (
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-foreground">{profile?.name || "Sem nome"}</h1>
                  <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {profile?.username ? `@${profile.username}` : "sem username"}
                  {profile?.aka ? ` · AKA: ${profile.aka}` : ""}
                </p>
              </div>
            )}
          </div>

          {editing && (
            <div className="mb-4 space-y-3">
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Escreva sua bio..." className="bg-muted border-border resize-none text-sm" rows={3} />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-gold-light" size="sm">
                  <Save className="w-4 h-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}
                </Button>
                <Button onClick={() => { setEditing(false); setName(profile?.name || ""); setUsername(profile?.username || ""); setAka(profile?.aka || ""); setBio(profile?.bio || ""); }} variant="outline" size="sm" className="border-border text-muted-foreground">
                  <X className="w-4 h-4 mr-1" /> Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProfileTabsAndBadges userId={user!.id} bio={profile?.bio} />
    </div>
  );
}

function ProfileTabsAndBadges({ userId, bio }: { userId: string; bio?: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [nominations, setNominations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [savings, setSavings] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, [userId]);

  const loadAll = async () => {
    setLoading(true);
    const [postsRes, reactionsRes, nomsRes, catsRes, contRes, savRes, ubRes, bRes] = await Promise.all([
      supabase.from("posts").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("reactions").select("*"),
      supabase.from("award_nominations").select("*").eq("nominated_user_id", userId),
      supabase.from("award_categories").select("*"),
      supabase.from("contributions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("group_savings").select("*"),
      supabase.from("user_badges").select("*").eq("user_id", userId),
      supabase.from("badges").select("*"),
    ]);
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

  if (loading) return <p className="text-muted-foreground text-sm text-center py-4">Carregando...</p>;

  const myBadges = userBadges.map((ub) => badges.find((b) => b.id === ub.badge_id)).filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto">
      {bio && <p className="text-foreground text-sm mb-4 px-6">{bio}</p>}

      {myBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 px-6">
          {myBadges.map((badge: any) => (
            <span key={badge.id} className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full font-medium" title={badge.description}>
              <span className="text-base">{badge.emoji}</span> {badge.name}
            </span>
          ))}
        </div>
      )}

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
