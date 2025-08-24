import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Collaborate from "./pages/Collaborate";
import Learn from "./pages/Learn";
import Experience from "./pages/Experience";
import Contact from "./pages/Contact";
import Insights from "./pages/Insights";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes("404")) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<AuthGuard><Feed /></AuthGuard>} />
            <Route path="/explore" element={<AuthGuard><Explore /></AuthGuard>} />
            <Route path="/profile/:username" element={<AuthGuard><Profile /></AuthGuard>} />
            <Route path="/collaborate" element={<AuthGuard><Collaborate /></AuthGuard>} />
            <Route path="/learn" element={<AuthGuard><Learn /></AuthGuard>} />
            <Route path="/experience" element={<AuthGuard><Experience /></AuthGuard>} />
            <Route path="/contact" element={<AuthGuard><Contact /></AuthGuard>} />
            <Route path="/insights" element={<AuthGuard><Insights /></AuthGuard>} />
            <Route path="/account" element={<AuthGuard><Account /></AuthGuard>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
