import { motion } from "framer-motion";
import { Heart, MessageCircle, BarChart3, ImageIcon, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function FeedPage() {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [reactions, setReactions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-6 text-gradient-gold">Feed</h1>

      {/* Compose */}
      <div className="bg-gradient-card border border-border rounded-xl p-4 mb-6">
        <Textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Solta o verbo, vagabundo..."
          className="bg-transparent border-none resize-none text-foreground placeholder:text-muted-foreground mb-3"
          rows={3}
        />
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-gold-light"
            onClick={handlePost}
            disabled={posting || !newPost.trim()}
          >
            <Send className="w-4 h-4 mr-1" /> Postar
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
        <div className="space-y-4">
          {posts.map((post, i) => {
            const profile = profiles[post.user_id];
            const postReactions = reactions.filter((r) => r.post_id === post.id);
            const postComments = comments.filter((c) => c.post_id === post.id);
            const userReacted = postReactions.some((r) => r.user_id === user?.id);

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-card border border-border rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                    ) : "👤"}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{profile?.name || "Anônimo"}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.aka ? `AKA ${profile.aka} · ` : ""}{timeAgo(post.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-foreground mb-4">{post.content}</p>

                <div className="flex items-center gap-6 text-muted-foreground">
                  <button
                    onClick={() => handleReact(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${userReacted ? "text-primary" : "hover:text-primary"}`}
                  >
                    <Heart className={`w-4 h-4 ${userReacted ? "fill-primary" : ""}`} /> {postReactions.length}
                  </button>
                  <span className="flex items-center gap-1.5 text-sm">
                    <MessageCircle className="w-4 h-4" /> {postComments.length}
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
