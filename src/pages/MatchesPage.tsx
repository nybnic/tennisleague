import { useState, useMemo } from 'react';
import { Match } from '@/types/tennis';
import { useLeagueData } from '@/hooks/useLeagueData';
import { PlayerManager } from '@/components/PlayerManager';
import { MatchDialog } from '@/components/MatchDialog';
import { MatchList } from '@/components/MatchList';
import { BottomNav } from '@/components/BottomNav';
import { SeasonSelector } from '@/components/SeasonSelector';
import { SeasonAuthDialog } from '@/components/SeasonAuthDialog';
import { calculateEloDeltas } from '@/utils/eloDelta';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function MatchesPage() {
  const {
    players,
    matches,
    rawMatches,
    seasons,
    currentSeasonId,
    loading,
    error,
    switchSeason,
    createSeason,
    authenticateSeason,
    isSeasonAuthenticated,
    addPlayer,
    updatePlayer,
    deletePlayer,
    addMatch,
    updateMatch,
    deleteMatch,
  } = useLeagueData();

  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const eloDeltas = useMemo(() => calculateEloDeltas(players, rawMatches), [players, rawMatches]);

  const isAuthenticated = currentSeasonId ? isSeasonAuthenticated(currentSeasonId) : false;
  const currentSeason = seasons.find(s => s.id === currentSeasonId);

  const handleAddMatch = async (match: Omit<Match, 'id' | 'createdAt'>) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    try {
      await addMatch(match);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to add match');
    }
  };

  const handleUpdateMatch = async (id: string, data: Partial<Omit<Match, 'id' | 'createdAt'>>) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    try {
      await updateMatch(id, data);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to update match');
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    try {
      await deleteMatch(id);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to delete match');
    }
  };

  const handleAuthenticate = async (passcode: string) => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      if (currentSeasonId) {
        authenticateSeason(currentSeasonId, passcode);
      }
      setShowAuthDialog(false);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container space-y-3 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-bold tracking-tight">🎾 Matches</h1>
            <SeasonSelector
              seasons={seasons}
              currentSeasonId={currentSeasonId}
              onSeasonChange={switchSeason}
              onCreateSeason={createSeason}
            />
          </div>
          {!isAuthenticated && currentSeasonId && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
              Authenticate with passcode to modify matches
            </div>
          )}
        </div>
      </header>
      <main className="container py-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading matches...</div>
        ) : !currentSeasonId ? (
          <Alert className="text-center py-8">
            <AlertDescription>Create or select a season to view matches</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {currentSeason ? `Season: ${currentSeason.name}` : 'No season selected'}
              </div>
              <div className="flex gap-2">
                <PlayerManager
                  players={players}
                  onAdd={addPlayer}
                  onUpdate={updatePlayer}
                  onDelete={deletePlayer}
                />
                {isAuthenticated && (
                  <MatchDialog
                    players={players}
                    matches={rawMatches}
                    onAdd={handleAddMatch}
                    onUpdate={handleUpdateMatch}
                    editMatch={editMatch}
                    onEditDone={() => setEditMatch(null)}
                    lastMatch={matches.length > 0 ? matches[0] : null}
                  />
                )}
              </div>
            </div>
            {!isAuthenticated ? (
              <Alert>
                <div className="flex items-center justify-between">
                  <AlertDescription>
                    Authenticate with the season passcode to add or modify matches.
                  </AlertDescription>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAuthDialog(true)}
                    className="ml-4"
                  >
                    Authenticate
                  </Button>
                </div>
              </Alert>
            ) : null}
            <MatchList
              matches={matches}
              players={players}
              onEdit={setEditMatch}
              onDelete={handleDeleteMatch}
              eloDeltas={eloDeltas}
              canEdit={isAuthenticated}
            />
          </div>
        )}
      </main>
      <BottomNav />

      <SeasonAuthDialog
        isOpen={showAuthDialog}
        seasonName={currentSeason?.name || 'Season'}
        onAuthenticate={handleAuthenticate}
        onClose={() => setShowAuthDialog(false)}
        isLoading={authLoading}
        error={authError}
      />
    </div>
  );
}
