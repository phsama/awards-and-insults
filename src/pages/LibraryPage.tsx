import { motion } from "framer-motion";
import { Search, FileText, Link2, Tag, Upload, Plus, ExternalLink, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function LibraryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form
  const [tab, setTab] = useState("file");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Título obrigatório"); return; }
    setUploading(true);

    let fileUrl: string | null = null;

    if (tab === "file" && file) {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file);
      if (error) { toast.error("Erro no upload: " + error.message); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      fileUrl = urlData.publicUrl;
    }

    const parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);

    const { error } = await supabase.from("library_items").insert({
      title: title.trim(),
      type: tab === "link" ? "link" : "file",
      url: tab === "link" ? url.trim() : null,
      file_url: fileUrl,
      tags: parsedTags.length > 0 ? parsedTags : null,
      user_id: user!.id,
    });

    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success("Item adicionado!");
      setTitle(""); setUrl(""); setTags(""); setFile(null); setOpen(false);
      loadLibrary();
    }
    setUploading(false);
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("library_items").delete().eq("id", id);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success("Removido"); loadLibrary(); }
  };

  const openItem = (item: any) => {
    const link = item.type === "link" ? item.url : item.file_url;
    if (link) window.open(link, "_blank");
  };

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    (item.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gradient-gold">Biblioteca</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-gold-light">
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">Novo Item</DialogTitle>
            </DialogHeader>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full">
                <TabsTrigger value="file" className="flex-1"><Upload className="w-4 h-4 mr-1" /> Arquivo</TabsTrigger>
                <TabsTrigger value="link" className="flex-1"><Link2 className="w-4 h-4 mr-1" /> Link</TabsTrigger>
              </TabsList>
              <TabsContent value="file" className="space-y-3 mt-3">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="bg-muted border-border" />
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <Button variant="outline" className="w-full border-border text-foreground" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> {file ? file.name : "Escolher arquivo"}
                </Button>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (separadas por vírgula)" className="bg-muted border-border" />
                <Button onClick={handleSubmit} disabled={uploading} className="w-full bg-primary text-primary-foreground hover:bg-gold-light">
                  {uploading ? "Enviando..." : "Enviar"}
                </Button>
              </TabsContent>
              <TabsContent value="link" className="space-y-3 mt-3">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="bg-muted border-border" />
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="bg-muted border-border" />
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (separadas por vírgula)" className="bg-muted border-border" />
                <Button onClick={handleSubmit} disabled={uploading} className="w-full bg-primary text-primary-foreground hover:bg-gold-light">
                  Salvar
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Buscar na biblioteca..." className="pl-10 bg-muted border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              className="bg-gradient-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center cursor-pointer" onClick={() => openItem(item)}>
                {item.type === "link" ? <Link2 className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openItem(item)}>
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
              <div className="flex gap-1">
                <button onClick={() => openItem(item)} className="text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
                {item.user_id === user?.id && (
                  <button onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
