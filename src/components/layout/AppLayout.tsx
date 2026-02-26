import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop sidebar */}
      <DesktopSidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
