import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Signup from "./pages/Signup.tsx";
import Login from "./pages/Login.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Formation from "./pages/Formation.tsx";
import ChatNew from "./pages/ChatNew.tsx";
import ChatRoom from "./pages/ChatRoom.tsx";
import ListenQueue from "./pages/ListenQueue.tsx";
import NotFound from "./pages/NotFound.tsx";
import About from "./pages/About.tsx";
import ListenerSignup from "./pages/ListenerSignup.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/formation" element={<Formation />} />
          <Route path="/chat/new" element={<ChatNew />} />
          <Route path="/chat/:sessionId" element={<ChatRoom />} />
          <Route path="/listen" element={<ListenQueue />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
