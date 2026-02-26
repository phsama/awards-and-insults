import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, RequireAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import AwardsPage from "./pages/AwardsPage";
import FeedPage from "./pages/FeedPage";
import EventsPage from "./pages/EventsPage";
import LibraryPage from "./pages/LibraryPage";
import SavingsPage from "./pages/SavingsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/awards" replace />} />
            <Route
              path="/awards"
              element={
                <RequireAuth>
                  <AppLayout><AwardsPage /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/feed"
              element={
                <RequireAuth>
                  <AppLayout><FeedPage /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/eventos"
              element={
                <RequireAuth>
                  <AppLayout><EventsPage /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/biblioteca"
              element={
                <RequireAuth>
                  <AppLayout><LibraryPage /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/poupanca"
              element={
                <RequireAuth>
                  <AppLayout><SavingsPage /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/perfil"
              element={
                <RequireAuth>
                  <AppLayout><ProfilePage /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AppLayout><AdminPage /></AppLayout>
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
