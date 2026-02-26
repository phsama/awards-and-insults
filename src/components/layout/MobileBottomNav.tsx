import { NavLink, useLocation } from "react-router-dom";
import { Trophy, MessageSquare, Calendar, BookOpen, PiggyBank, User } from "lucide-react";

const navItems = [
  { to: "/awards", label: "Awards", icon: Trophy },
  { to: "/feed", label: "Feed", icon: MessageSquare },
  { to: "/eventos", label: "Eventos", icon: Calendar },
  { to: "/biblioteca", label: "Biblioteca", icon: BookOpen },
  { to: "/poupanca", label: "Poupança", icon: PiggyBank },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_6px_hsl(43_56%_52%/0.5)]" : ""}`} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
