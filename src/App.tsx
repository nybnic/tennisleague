import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LeagueProvider } from "@/contexts/LeagueContext";
import LandingPage from "./pages/LandingPage";
import LeagueDashboard from "./pages/LeagueDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LeagueProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/league/:leagueId/matches" element={<LeagueDashboard page="matches" />} />
            <Route path="/league/:leagueId/standings" element={<LeagueDashboard page="standings" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LeagueProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
