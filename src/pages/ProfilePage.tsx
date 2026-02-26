import { motion } from "framer-motion";
import { Trophy, MessageSquare, PiggyBank, Settings, Camera } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const user = {
    name: "Zé Ninguém",
    username: "zeninguem",
    aka: "O Imprevisível",
    bio: "Profissional em fazer nada e ser lembrado por tudo.",
    avatar: "🤡",
    awards: 3,
    posts: 42,
    saved: 850,
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Cover */}
      <div className="relative h-40 md:h-56 bg-gradient-to-br from-green-deep to-background">
        <button className="absolute bottom-3 right-3 p-2 rounded-lg bg-card/80 text-muted-foreground hover:text-primary">
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Avatar + Info */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex items-end gap-4 mb-4">
          <div className="w-24 h-24 rounded-2xl bg-card border-4 border-background flex items-center justify-center text-5xl shadow-gold">
            {user.avatar}
          </div>
          <div className="pb-1">
            <h1 className="font-display text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground">@{user.username} · AKA: {user.aka}</p>
          </div>
        </div>
        <p className="text-foreground text-sm mb-4">{user.bio}</p>

        <div className="flex gap-6 mb-6">
          {[
            { label: "Awards", value: user.awards, icon: Trophy },
            { label: "Posts", value: user.posts, icon: MessageSquare },
            { label: "Guardado", value: `R$${user.saved}`, icon: PiggyBank },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-lg font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
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
