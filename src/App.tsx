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
import Breathe from "./pages/Breathe.tsx";
import Settings from "./pages/Settings.tsx";
import Moderation from "./pages/Moderation.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import RoleRedirect from "./components/echo/RoleRedirect.tsx";
import ProtectedRoute from "./components/echo/ProtectedRoute.tsx";
import Onboarding from "./pages/Onboarding.tsx";

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
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Dashboards */}
          <Route path="/dashboard/seeker" element={<ProtectedRoute allow={["seeker"]}><SeekerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/listener" element={<ProtectedRoute allow={["listener"]}><ListenerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/room" element={<ProtectedRoute allow={["seeker"]}><DashboardRoom /></ProtectedRoute>} />
          <Route path="/dashboard/journal" element={<ProtectedRoute allow={["seeker"]}><Journal /></ProtectedRoute>} />
          <Route path="/dashboard/shelf" element={<ProtectedRoute allow={["seeker"]}><MemoryShelfPage /></ProtectedRoute>} />
          <Route path="/dashboard/patterns" element={<ProtectedRoute allow={["seeker"]}><PatternsPage /></ProtectedRoute>} />
          <Route path="/dashboard/breathe" element={<ProtectedRoute><Breathe /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

          {/* Listener-only */}
          <Route path="/formation" element={<ProtectedRoute allow={["listener"]}><Formation /></ProtectedRoute>} />
          <Route path="/listen" element={<ProtectedRoute allow={["listener"]}><ListenQueue /></ProtectedRoute>} />

          {/* Shared */}
          <Route path="/chat/new" element={<ProtectedRoute><ChatNew /></ProtectedRoute>} />
          <Route path="/chat/:sessionId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
          <Route path="/aura" element={<ProtectedRoute allow={["seeker"]}><AuraChat /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/mod" element={<ProtectedRoute allow={["listener"]}><Moderation /></ProtectedRoute>} />

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
