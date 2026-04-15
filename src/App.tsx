import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useThemeInit } from "@/hooks/use-theme-init";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import SeekerDashboard from "./pages/SeekerDashboard.tsx";
import ListenerDashboard from "./pages/ListenerDashboard.tsx";
import Formation from "./pages/Formation.tsx";
import ChatNew from "./pages/ChatNew.tsx";
import ChatRoom from "./pages/ChatRoom.tsx";
import ListenQueue from "./pages/ListenQueue.tsx";
import NotFound from "./pages/NotFound.tsx";
import About from "./pages/About.tsx";
import ListenerSignup from "./pages/ListenerSignup.tsx";
import SeekerSignup from "./pages/SeekerSignup.tsx";
import AuraChat from "./pages/AuraChat.tsx";
import DashboardRoom from "./pages/DashboardRoom.tsx";
import Journal from "./pages/Journal.tsx";
import MemoryShelfPage from "./pages/MemoryShelf.tsx";
import PatternsPage from "./pages/Patterns.tsx";
import Settings from "./pages/Settings.tsx";
import Moderation from "./pages/Moderation.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import RoleRedirect from "./components/echo/RoleRedirect.tsx";

const queryClient = new QueryClient();

const AppInner = () => {
  useThemeInit();
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />

          {/* Auth */}
          <Route path="/signup/seeker" element={<SeekerSignup />} />
          <Route path="/signup/listener" element={<ListenerSignup />} />
          <Route path="/signup" element={<Navigate to="/signup/seeker" replace />} />
          <Route path="/listener-signup" element={<Navigate to="/signup/listener" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Dashboards */}
          <Route path="/dashboard/seeker" element={<SeekerDashboard />} />
          <Route path="/dashboard/listener" element={<ListenerDashboard />} />
          <Route path="/dashboard/room" element={<DashboardRoom />} />
          <Route path="/dashboard/journal" element={<Journal />} />
          <Route path="/dashboard/shelf" element={<MemoryShelfPage />} />
          <Route path="/dashboard/patterns" element={<PatternsPage />} />
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Listener-only */}
          <Route path="/formation" element={<Formation />} />
          <Route path="/listen" element={<ListenQueue />} />

          {/* Shared */}
          <Route path="/chat/new" element={<ChatNew />} />
          <Route path="/chat/:sessionId" element={<ChatRoom />} />
          <Route path="/aura" element={<AuraChat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/mod" element={<Moderation />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppInner />
  </QueryClientProvider>
);

export default App;
