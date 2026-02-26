import { NavLink, useLocation } from "react-router-dom";
import { Trophy, MessageSquare, Calendar, BookOpen, PiggyBank, User, LogOut, Settings, Vote } from "lucide-react";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/awards", label: "Awards", icon: Trophy },
  { to: "/votacao", label: "Votação", icon: Vote },
  { to: "/feed", label: "Feed", icon: MessageSquare },
  { to: "/eventos", label: "Eventos", icon: Calendar },
  { to: "/biblioteca", label: "Biblioteca", icon: BookOpen },
  { to: "/poupanca", label: "Poupança", icon: PiggyBank },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLider } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const allItems = isLider
    ? [...navItems, { to: "/admin", label: "Gerenciar", icon: Settings }]
    : navItems;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border min-h-screen">
      <div className="p-6 flex flex-col items-center justify-center">
        <img
          src={logo}
          alt="Motherfucker Awards"
          className="w-40 h-auto"
          style={{ filter: 'drop-shadow(0 0 24px hsl(43 56% 52% / 0.4))' }}
        />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {allItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent text-accent-foreground border-gold shadow-gold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-muted transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
