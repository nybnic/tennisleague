import { useLeagueContext } from '@/contexts/LeagueContext';
import { BottomNav } from '@/components/BottomNav';
import { LeagueAuthDialog } from '@/components/LeagueAuthDialog';
import MatchesPage from '@/pages/MatchesPage';
import StandingsPage from '@/pages/StandingsPage';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LeagueDashboardProps {
  page?: 'matches' | 'standings';
}

export default function LeagueDashboard({ page = 'matches' }: LeagueDashboardProps) {
  const { currentLeague, isLeagueAuthorized, authorizeLeague } = useLeagueContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Keep showAuthDialog synced with isLeagueAuthorized
  useEffect(() => {
    setShowAuthDialog(!isLeagueAuthorized);
  }, [isLeagueAuthorized]);

  if (!currentLeague) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No League Selected</h1>
          <p className="text-muted-foreground mb-6">
            Please select a league from the home page
          </p>
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAuthenticate = (passcode: string) => {
    try {
      setAuthError(null);
      authorizeLeague(passcode);
      setShowAuthDialog(false);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  return (
    <>
      {page === 'matches' ? <MatchesPage /> : <StandingsPage />}
      <BottomNav />

      <LeagueAuthDialog
        isOpen={showAuthDialog && !isLeagueAuthorized}
        leagueName={currentLeague.name}
        onAuthenticate={handleAuthenticate}
        onClose={() => setShowAuthDialog(false)}
        isLoading={false}
        error={authError}
      />
    </>
  );
}
