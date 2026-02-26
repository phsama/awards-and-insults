import { motion } from "framer-motion";
import { Trophy, MessageSquare, PiggyBank, Camera, Pencil, Save, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [aka, setAka] = useState("");
  const [bio, setBio] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    setProfile(data);
    if (data) {
      setName(data.name || "");
      setUsername(data.username || "");
      setAka(data.aka || "");
      setBio(data.bio || "");
    }
    setLoading(false);
  };

  const uploadImage = async (file: File, type: "avatar" | "cover"): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${type}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      toast.error("Erro no upload: " + error.message);
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const url = await uploadImage(file, "avatar");
    if (url) {
      await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user!.id);
      toast.success("Avatar atualizado!");
      loadProfile();
    }
    setSaving(false);
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const url = await uploadImage(file, "cover");
    if (url) {
      await supabase.from("profiles").update({ cover_url: url }).eq("user_id", user!.id);
      toast.success("Capa atualizada!");
      loadProfile();
    }
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: name.trim(),
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ""),
      aka: aka.trim(),
      bio: bio.trim(),
    }).eq("user_id", user!.id);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Perfil atualizado!");
      setEditing(false);
      loadProfile();
    }
    setSaving(false);
  };

  if (loading) return <p className="text-muted-foreground text-sm text-center py-12">Carregando...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />

      {/* Cover */}
      <div
        className="relative h-48 md:h-72 bg-gradient-to-br from-green-deep to-background overflow-hidden group cursor-pointer"
        onClick={() => coverInputRef.current?.click()}
      >
        {profile?.cover_url ? (
          <img src={profile.cover_url} className="w-full h-full object-cover" alt="Cover" />
        ) : null}
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors flex items-center justify-center">
          <Camera className="w-8 h-8 text-foreground opacity-0 group-hover:opacity-80 transition-opacity" />
        </div>
      </div>

      {/* Avatar + Info */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="flex items-end gap-5 mb-3">
          {/* Avatar */}
          <div
            className="relative w-32 h-32 rounded-2xl bg-card border-4 border-background flex items-center justify-center text-6xl shadow-gold overflow-hidden cursor-pointer group shrink-0"
            onClick={() => avatarInputRef.current?.click()}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              "👤"
            )}
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/50 transition-colors flex items-center justify-center">
              <Camera className="w-6 h-6 text-foreground opacity-0 group-hover:opacity-80 transition-opacity" />
            </div>
          </div>

          {/* Info or Edit */}
          {editing ? (
            <div className="flex-1 pb-1 space-y-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="bg-muted border-border text-lg font-display font-bold"
              />
              <div className="flex gap-2">
                <div className="flex items-center bg-muted border border-border rounded-md px-2">
                  <span className="text-muted-foreground text-sm">@</span>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="bg-transparent border-none text-sm p-1"
                  />
                </div>
                <Input
                  value={aka}
                  onChange={(e) => setAka(e.target.value)}
                  placeholder="AKA (apelido)"
                  className="bg-muted border-border text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-foreground">{profile?.name || "Sem nome"}</h1>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                >
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

        {/* Bio */}
        {editing ? (
          <div className="mb-4 space-y-3">
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Escreva sua bio... (quem é você nessa zona?)"
              className="bg-muted border-border resize-none text-sm"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-gold-light"
                size="sm"
              >
                <Save className="w-4 h-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                onClick={() => {
                  setEditing(false);
                  setName(profile?.name || "");
                  setUsername(profile?.username || "");
                  setAka(profile?.aka || "");
                  setBio(profile?.bio || "");
                }}
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground"
              >
                <X className="w-4 h-4 mr-1" /> Cancelar
              </Button>
            </div>
          </div>
        ) : (
          profile?.bio && <p className="text-foreground text-sm mb-4">{profile.bio}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 pb-8">
        <Tabs defaultValue="posts">
          <TabsList className="bg-muted w-full justify-start">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="awards">Awards</TabsTrigger>
            <TabsTrigger value="poupanca">Poupança</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-4">
            <div className="text-center text-muted-foreground py-12">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Posts vão aparecer aqui</p>
            </div>
          </TabsContent>
          <TabsContent value="awards" className="mt-4">
            <div className="text-center text-muted-foreground py-12">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Troféus do vagabundo</p>
            </div>
          </TabsContent>
          <TabsContent value="poupanca" className="mt-4">
            <div className="text-center text-muted-foreground py-12">
              <PiggyBank className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Histórico de poupança</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
