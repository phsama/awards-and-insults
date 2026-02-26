import { motion } from "framer-motion";
import { Search, FileText, Link2, Tag, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function LibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLibrary(); }, []);

  const loadLibrary = async () => {
    setLoading(true);
    const [itemsRes, profilesRes] = await Promise.all([
      supabase.from("library_items").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*"),
    ]);
    setItems(itemsRes.data || []);
    const pMap: Record<string, any> = {};
    (profilesRes.data || []).forEach((p: any) => { pMap[p.user_id] = p; });
    setProfiles(pMap);
    setLoading(false);
  };

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    (item.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gradient-gold">Biblioteca</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar na biblioteca..."
          className="pl-10 bg-muted border-border"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {items.length === 0 ? "Biblioteca vazia. Adicione o primeiro item!" : "Nenhum resultado encontrado."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gradient-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                {item.type === "link" ? <Link2 className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">por {profiles[item.user_id]?.name || "Anônimo"}</p>
              </div>
              <div className="hidden sm:flex gap-1.5">
                {(item.tags || []).map((tag: string) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
