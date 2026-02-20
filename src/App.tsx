import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LeagueProvider } from "@/contexts/LeagueContext";
import { UserProvider } from "@/contexts/UserContext";
import { useUser } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { isNewAuthSystem } from "@/config/authSystem";
import PublicLandingPage from "./pages/PublicLandingPage";
import DashboardPage from "./pages/DashboardPage";
import LeagueDashboard from "./pages/LeagueDashboard";
import NotFound from "./pages/NotFound";
import { DebugAuthPage } from "./pages/DebugAuthPage";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import CallbackPage from "./pages/auth/CallbackPage";

const queryClient = new QueryClient();

// Home page router - shows different content based on auth state
function HomeRouter() {
  const { isAuthenticated } = useUser();

  if (isNewAuthSystem) {
    // Auth system: Show DashboardPage if authenticated, PublicLandingPage otherwise
    return isAuthenticated ? <DashboardPage /> : <PublicLandingPage />;
  } else {
    // Passcode system: Show DashboardPage (handles both auth and selection)
    return <DashboardPage />;
  }
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UserProvider>
          <LeagueProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/debug-auth" element={<DebugAuthPage />} />
                <Route path="/diagnostics" element={<DiagnosticsPage />} />
                <Route path="/auth/sign-in" element={<SignInPage />} />
                <Route path="/auth/sign-up" element={<SignUpPage />} />
                <Route path="/auth/callback" element={<CallbackPage />} />
                <Route path="/" element={<HomeRouter />} />
                <Route
                  path="/league/:leagueId/matches"
                  element={
                    <ProtectedRoute>
                      <LeagueDashboard page="matches" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/league/:leagueId/standings"
                  element={
                    <ProtectedRoute>
                      <LeagueDashboard page="standings" />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </LeagueProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
