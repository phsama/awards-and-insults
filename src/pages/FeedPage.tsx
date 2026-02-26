import { motion } from "framer-motion";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function FeedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [reactions, setReactions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => { loadFeed(); }, []);

  const loadFeed = async () => {
    setLoading(true);
    const [postsRes, profilesRes, reactionsRes, commentsRes] = await Promise.all([
      supabase.from("posts").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*"),
      supabase.from("reactions").select("*"),
      supabase.from("comments").select("*"),
    ]);
    setPosts(postsRes.data || []);
    setReactions(reactionsRes.data || []);
    setComments(commentsRes.data || []);
    const pMap: Record<string, any> = {};
    (profilesRes.data || []).forEach((p: any) => { pMap[p.user_id] = p; });
    setProfiles(pMap);
    setLoading(false);
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({ content: newPost.trim(), user_id: user.id });
    if (error) { toast.error("Erro ao postar"); }
    else { setNewPost(""); await loadFeed(); }
    setPosting(false);
  };

  const handleReact = async (postId: string) => {
    if (!user) return;
    const existing = reactions.find((r) => r.post_id === postId && r.user_id === user.id);
    if (existing) {
      await supabase.from("reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, emoji: "❤️" });
    }
    loadFeed();
  };

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h`;
    return `${Math.floor(mins / 1440)}d`;
  };

  // Accent colors for avatar ring based on index
  const accentColors = [
    "ring-primary",
    "ring-[hsl(157,70%,40%)]",
    "ring-[hsl(280,50%,55%)]",
    "ring-[hsl(200,70%,50%)]",
    "ring-[hsl(350,60%,55%)]",
  ];

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <h1 className="font-display text-3xl font-bold mb-5 text-gradient-gold">Feed</h1>

      {/* Compose */}
      <div className="bg-gradient-card border border-border rounded-2xl p-5 mb-5 shadow-gold">
        <div className="flex gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/20 ring-2 ring-primary flex items-center justify-center text-lg shrink-0 overflow-hidden">
            {profiles[user?.id || ""]?.avatar_url ? (
              <img src={profiles[user!.id].avatar_url} className="w-full h-full object-cover" />
            ) : "✍️"}
          </div>
          <div className="flex-1">
            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Solta o verbo, vagabundo..."
              className="bg-transparent border-none resize-none text-foreground placeholder:text-muted-foreground text-[15px] min-h-[60px] p-0 focus-visible:ring-0"
              rows={2}
            />
          </div>
        </div>
        <div className="flex items-center justify-end mt-2">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-gold-light rounded-full px-5"
            onClick={handlePost}
            disabled={posting || !newPost.trim()}
          >
            <Send className="w-4 h-4 mr-1.5" /> Postar
          </Button>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum post ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => {
            const profile = profiles[post.user_id];
            const postReactions = reactions.filter((r) => r.post_id === post.id);
            const postComments = comments.filter((c) => c.post_id === post.id);
            const userReacted = postReactions.some((r) => r.user_id === user?.id);
            const ringColor = accentColors[i % accentColors.length];

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-gradient-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start gap-3.5 mb-3 cursor-pointer" onClick={() => navigate(`/perfil/${post.user_id}`)}>
                  <div className={`w-12 h-12 rounded-full bg-muted ring-2 ${ringColor} flex items-center justify-center text-xl shrink-0 overflow-hidden`}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                    ) : "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-foreground text-[15px] hover:text-primary transition-colors">{profile?.aka || profile?.name || "Anônimo"}</p>
                      {profile?.aka && profile?.name && (
                        <span className="text-xs text-muted-foreground font-medium">({profile.name})</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {profile?.username ? `@${profile.username} · ` : ""}{timeAgo(post.created_at)}
                    </p>
                  </div>
                </div>

                <p className="text-foreground text-[15px] leading-relaxed mb-4 pl-[60px]">{post.content}</p>

                <div className="flex items-center gap-5 pl-[60px]">
                  <button
                    onClick={() => handleReact(post.id)}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
                      userReacted
                        ? "text-[hsl(350,70%,55%)]"
                        : "text-muted-foreground hover:text-[hsl(350,70%,55%)]"
                    }`}
                  >
                    <Heart className={`w-[18px] h-[18px] transition-transform ${userReacted ? "fill-[hsl(350,70%,55%)] scale-110" : ""}`} />
                    {postReactions.length > 0 && postReactions.length}
                  </button>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MessageCircle className="w-[18px] h-[18px]" />
                    {postComments.length > 0 && postComments.length}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
