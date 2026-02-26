import { motion } from "framer-motion";
import { Search, FileText, Link2, Tag, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const mockItems = [
  { id: 1, title: "Receita do churrasco secreto", type: "link", tags: ["comida", "churrasco"], author: "Chef Desastre" },
  { id: 2, title: "Playlist da premiação 2024", type: "link", tags: ["música", "awards"], author: "DJ do Grupo" },
  { id: 3, title: "Fotos do último rolê", type: "file", tags: ["fotos", "rolê"], author: "Maria Sumida" },
  { id: 4, title: "Regras do bolão", type: "file", tags: ["bolão", "regras"], author: "Guru do Grupo" },
  { id: 5, title: "Melhores memes do grupo", type: "link", tags: ["memes", "humor"], author: "Zé Ninguém" },
];

export default function LibraryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gradient-gold">Biblioteca</h1>
        <Button className="bg-primary text-primary-foreground hover:bg-gold-light">
          <Upload className="w-4 h-4 mr-2" /> Upload
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar na biblioteca..."
          className="pl-10 bg-muted border-border"
        />
      </div>

      <div className="space-y-3">
        {mockItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-gradient-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              {item.type === "link" ? (
                <Link2 className="w-5 h-5 text-primary" />
              ) : (
                <FileText className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">por {item.author}</p>
            </div>
            <div className="hidden sm:flex gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                >
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
