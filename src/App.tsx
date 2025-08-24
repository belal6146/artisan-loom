import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Login from "./pages/Login";

// Lazy load pages for code splitting
const ExploreHome = lazy(() => import("./pages/ExploreHome"));
const Profile = lazy(() => import("./pages/Profile"));
const Collaborate = lazy(() => import("./pages/Collaborate"));
const Learn = lazy(() => import("./pages/Learn"));
const Experience = lazy(() => import("./pages/Experience"));
const Contact = lazy(() => import("./pages/Contact"));
const Insights = lazy(() => import("./pages/Insights"));
const Account = lazy(() => import("./pages/Account"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

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
            
            {/* Protected routes with code splitting */}
            <Route path="/" element={
              <AuthGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <ExploreHome />
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/explore" element={<Navigate to="/" replace />} />
            <Route path="/feed" element={<Navigate to="/" replace />} />
            <Route path="/profile/:handle" element={
              <AuthGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <Profile />
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/collaborate" element={
              <AuthGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <Collaborate />
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/learn" element={
              <AuthGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <Learn />
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/experience" element={
              <AuthGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <Experience />
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/contact" element={
              <AuthGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <Contact />
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/insights" element={
              <AuthGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <Insights />
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/account" element={
              <AuthGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <Account />
                </Suspense>
              </AuthGuard>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={
              <Suspense fallback={<LoadingSpinner />}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
