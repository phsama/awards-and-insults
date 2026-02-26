import { motion } from "framer-motion";
import { PiggyBank, Target, TrendingUp, Plus, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function SavingsPage() {
  const { user, isLider } = useAuth();
  const [savings, setSavings] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create caixinha form
  const [newName, setNewName] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  // Deposit form
  const [depositSavingsId, setDepositSavingsId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [savRes, contRes, profRes, goalsRes] = await Promise.all([
      supabase.from("group_savings").select("*"),
      supabase.from("contributions").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("personal_goals").select("*").eq("user_id", user?.id || ""),
    ]);
    setSavings(savRes.data || []);
    setContributions(contRes.data || []);
    setGoals(goalsRes.data || []);
    const pMap: Record<string, any> = {};
    (profRes.data || []).forEach((p: any) => { pMap[p.user_id] = p; });
    setProfiles(pMap);
    setLoading(false);
  };

  const createSavings = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("group_savings").insert({
      name: newName.trim(),
      goal: Number(newGoal) || 0,
    });
    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success("Caixinha criada!");
      setNewName(""); setNewGoal(""); setCreateOpen(false);
      loadData();
    }
  };

  const addDeposit = async () => {
    if (!depositSavingsId || !depositAmount) return;
    const { error } = await supabase.from("contributions").insert({
      savings_id: depositSavingsId,
      user_id: user!.id,
      amount: Number(depositAmount),
      note: depositNote.trim() || null,
    });
    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success("Depósito registrado!");
      setDepositSavingsId(null); setDepositAmount(""); setDepositNote("");
      loadData();
    }
  };

  if (loading) return <p className="text-muted-foreground text-sm text-center py-12">Carregando...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gradient-gold">Poupança</h1>
        {isLider && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-gold-light">
                <Plus className="w-4 h-4 mr-1" /> Nova Caixinha
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-foreground">Criar Caixinha</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome da caixinha" className="bg-muted border-border" />
                <Input type="number" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Meta (R$)" className="bg-muted border-border" />
                <Button onClick={createSavings} className="w-full bg-primary text-primary-foreground hover:bg-gold-light">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Group savings */}
      {savings.length === 0 ? (
        <div className="bg-gradient-card border border-border rounded-xl p-6 mb-8 text-center">
          <PiggyBank className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhuma caixinha criada ainda.</p>
        </div>
      ) : (
        savings.map((s) => {
          const sContribs = contributions.filter((c) => c.savings_id === s.id);
          const total = sContribs.reduce((acc, c) => acc + Number(c.amount), 0);
          const byUser: Record<string, number> = {};
          sContribs.forEach((c) => { byUser[c.user_id] = (byUser[c.user_id] || 0) + Number(c.amount); });
          const ranking = Object.entries(byUser)
            .map(([uid, amount]) => ({ name: profiles[uid]?.name || "Anônimo", amount }))
            .sort((a, b) => b.amount - a.amount);
          const isDepositing = depositSavingsId === s.id;

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-card border border-border rounded-xl p-6 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold text-foreground">{s.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    R$ {total.toLocaleString()} de R$ {Number(s.goal).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={isDepositing ? "secondary" : "default"}
                  className={isDepositing ? "" : "bg-primary text-primary-foreground hover:bg-gold-light"}
                  onClick={() => setDepositSavingsId(isDepositing ? null : s.id)}
                >
                  <DollarSign className="w-4 h-4 mr-1" /> Depositar
                </Button>
              </div>

              <Progress value={s.goal > 0 ? (total / Number(s.goal)) * 100 : 0} className="h-3 mb-2" />
              <span className="text-xs text-muted-foreground">
                {s.goal > 0 ? Math.round((total / Number(s.goal)) * 100) : 0}% da meta
              </span>

              {/* Deposit form inline */}
              {isDepositing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 flex gap-2">
                  <Input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Valor (R$)" className="bg-muted border-border w-28" />
                  <Input value={depositNote} onChange={(e) => setDepositNote(e.target.value)} placeholder="Nota (opcional)" className="bg-muted border-border flex-1" />
                  <Button onClick={addDeposit} className="bg-primary text-primary-foreground hover:bg-gold-light">
                    <Plus className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {ranking.length > 0 && (
                <>
                  <h3 className="font-display font-semibold text-foreground text-sm mt-4 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Ranking
                  </h3>
                  <div className="space-y-2">
                    {ranking.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {c.name}
                        </span>
                        <span className="text-primary font-semibold">R$ {c.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          );
        })
      )}

      {/* Personal goals */}
      <h2 className="font-display text-xl font-bold mb-4 text-foreground flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" /> Metas Individuais
      </h2>
      {goals.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhuma meta pessoal ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-card border border-border rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground font-medium text-sm">
                  {goal.emoji || "🎯"} {goal.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  R$ {Number(goal.current)} / R$ {Number(goal.goal)}
                </span>
              </div>
              <Progress value={Number(goal.goal) > 0 ? (Number(goal.current) / Number(goal.goal)) * 100 : 0} className="h-2" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
