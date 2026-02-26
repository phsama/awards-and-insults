import { motion } from "framer-motion";
import { Heart, MessageCircle, BarChart3, ImageIcon, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const mockPosts = [
  {
    id: 1,
    author: "Zé Ninguém",
    aka: "O Imprevisível",
    avatar: "🤡",
    content: "Quem aí tá pronto pra ser humilhado na premiação?",
    likes: 12,
    comments: 5,
    time: "2h atrás",
  },
  {
    id: 2,
    author: "Maria Sumida",
    aka: "Ghost do Grupo",
    avatar: "👻",
    content: "Gente, tô aqui. Só não mando mensagem porque tô ocupada fingindo que tenho vida social.",
    likes: 23,
    comments: 8,
    time: "4h atrás",
    isPoll: true,
    pollQuestion: "Quem merece o Award de 'Mais Sumido'?",
    pollOptions: [
      { label: "Maria Sumida", votes: 15 },
      { label: "João Fantasma", votes: 8 },
      { label: "Pedro Offline", votes: 3 },
    ],
  },
  {
    id: 3,
    author: "Guru do Grupo",
    aka: "O Conselheiro",
    avatar: "🧠",
    content: "Mais um capítulo dessa história. Lembrem: a zoeira nunca acaba, ela evolui.",
    likes: 31,
    comments: 12,
    time: "6h atrás",
  },
];

export default function FeedPage() {
  const [newPost, setNewPost] = useState("");

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
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-gold-light">
            <Send className="w-4 h-4 mr-1" /> Postar
          </Button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {mockPosts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{post.avatar}</span>
              <div>
                <p className="font-semibold text-foreground text-sm">{post.author}</p>
                <p className="text-xs text-muted-foreground">@{post.aka} · {post.time}</p>
              </div>
            </div>
            <p className="text-foreground mb-4">{post.content}</p>

            {post.isPoll && post.pollOptions && (
              <div className="space-y-2 mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-semibold text-primary mb-2">{post.pollQuestion}</p>
                {post.pollOptions.map((opt) => {
                  const total = post.pollOptions!.reduce((a, b) => a + b.votes, 0);
                  const pct = Math.round((opt.votes / total) * 100);
                  return (
                    <div key={opt.label} className="relative bg-muted rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative flex justify-between items-center px-3 py-2 text-sm">
                        <span className="text-foreground">{opt.label}</span>
                        <span className="text-primary font-semibold">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-6 text-muted-foreground">
              <button className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
                <Heart className="w-4 h-4" /> {post.likes}
              </button>
              <button className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
                <MessageCircle className="w-4 h-4" /> {post.comments}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
