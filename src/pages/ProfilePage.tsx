import { motion } from "framer-motion";
import { Trophy, MessageSquare, PiggyBank, Camera } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  };

  if (loading) return <p className="text-muted-foreground text-sm text-center py-12">Carregando...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Cover */}
      <div className="relative h-40 md:h-56 bg-gradient-to-br from-green-deep to-background overflow-hidden">
        {profile?.cover_url && (
          <img src={profile.cover_url} className="w-full h-full object-cover" alt="Cover" />
        )}
      </div>

      {/* Avatar + Info */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex items-end gap-4 mb-4">
          <div className="w-24 h-24 rounded-2xl bg-card border-4 border-background flex items-center justify-center text-5xl shadow-gold overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
            ) : "👤"}
          </div>
          <div className="pb-1">
            <h1 className="font-display text-2xl font-bold text-foreground">{profile?.name || "Sem nome"}</h1>
            <p className="text-sm text-muted-foreground">
              {profile?.username ? `@${profile.username}` : ""}
              {profile?.aka ? ` · AKA: ${profile.aka}` : ""}
            </p>
          </div>
        </div>
        {profile?.bio && <p className="text-foreground text-sm mb-4">{profile.bio}</p>}
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
