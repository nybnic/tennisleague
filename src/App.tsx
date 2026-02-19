import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LeagueProvider } from "@/contexts/LeagueContext";
import { UserProvider } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { isNewAuthSystem } from "@/config/authSystem";
import LandingPage from "./pages/LandingPage";
import LeagueDashboard from "./pages/LeagueDashboard";
import NotFound from "./pages/NotFound";
import { DebugAuthPage } from "./pages/DebugAuthPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import CallbackPage from "./pages/auth/CallbackPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isNewAuthSystem ? (
          <UserProvider>
            <LeagueProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/debug-auth" element={<DebugAuthPage />} />
                  <Route path="/auth/sign-in" element={<SignInPage />} />
                  <Route path="/auth/sign-up" element={<SignUpPage />} />
                  <Route path="/auth/callback" element={<CallbackPage />} />
                  <Route path="/" element={<LandingPage />} />
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
        ) : (
          <LeagueProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/debug-auth" element={<DebugAuthPage />} />
                <Route path="/" element={<LandingPage />} />
                <Route path="/league/:leagueId/matches" element={<LeagueDashboard page="matches" />} />
                <Route path="/league/:leagueId/standings" element={<LeagueDashboard page="standings" />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </LeagueProvider>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
