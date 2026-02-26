import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/awards");
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Falha no login: " + error.message);
    } else {
      navigate("/awards");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error("Código de convite obrigatório, parceiro.");
      return;
    }
    setLoading(true);

    // Verify invite code
    const { data: invite, error: inviteError } = await supabase
      .from("invites" as any)
      .select("*")
      .eq("code", inviteCode.trim())
      .eq("used", false)
      .maybeSingle();

    if (inviteError || !invite) {
      setLoading(false);
      toast.error("Código de convite inválido ou já usado.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setLoading(false);
      toast.error("Erro no cadastro: " + error.message);
      return;
    }

    // Mark invite as used
    await supabase.from("invites" as any).update({ used: true } as any).eq("id", (invite as any).id);

    setLoading(false);
    toast.success("Conta criada! Verifique seu email para confirmar.");
    setIsSignup(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-10">
          <img
            src={logo}
            alt="Motherfucker Awards"
            className="w-64 h-auto"
            style={{
              filter: 'drop-shadow(0 0 50px hsl(43 56% 52% / 0.45)) drop-shadow(0 0 100px hsl(43 56% 52% / 0.2))',
              mixBlendMode: 'lighten',
            }}
          />
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-gold">
          <h1 className="font-display text-2xl font-bold text-center mb-2 text-gradient-gold">
            {isSignup ? "Entra pro bonde" : "Vai votar ou vai pipocar?"}
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-6">
            {isSignup
              ? "Cadastro apenas com convite. Sem atalho, sem jeitinho."
              : "O único prêmio que importa é a nossa zoeira."}
          </p>

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {isSignup && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Código de Convite
                </label>
                <Input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Cole o código aqui"
                  className="bg-muted border-border focus:border-primary"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-muted border-border focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-muted border-border focus:border-primary"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-gold-light font-semibold text-base py-5"
            >
              {loading ? "Carregando..." : isSignup ? "Criar conta" : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignup ? "Já tem conta? Entrar" : "Tem um convite? Criar conta"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
