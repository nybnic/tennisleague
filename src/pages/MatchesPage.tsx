import { useState, useMemo } from 'react';
import { Match } from '@/types/tennis';
import { useLeagueData } from '@/hooks/useLeagueData';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { PlayerManager } from '@/components/PlayerManager';
import { MatchDialog } from '@/components/MatchDialog';
import { MatchList } from '@/components/MatchList';
import { SeasonSelector } from '@/components/SeasonSelector';
import { LeagueHeader } from '@/components/LeagueHeader';
import { calculateEloDeltas } from '@/utils/eloDelta';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MatchesPage() {
  const { isLeagueAuthorized } = useLeagueContext();
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
    addPlayer,
    updatePlayer,
    deletePlayer,
    addMatch,
    updateMatch,
    deleteMatch,
  } = useLeagueData();

  const [editMatch, setEditMatch] = useState<Match | null>(null);

  const eloDeltas = useMemo(() => calculateEloDeltas(players, rawMatches), [players, rawMatches]);
  const currentSeason = seasons.find(s => s.id === currentSeasonId);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <LeagueHeader currentSeasonName={currentSeason?.name} />
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container space-y-3 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-bold tracking-tight">🎾 Matches</h1>
            <SeasonSelector
              seasons={seasons}
              currentSeasonId={currentSeasonId}
              onSeasonChange={switchSeason}
              onCreateSeason={createSeason}
              readOnly={false}
            />
          </div>
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
                {isLeagueAuthorized && (
                  <MatchDialog
                    players={players}
                    matches={rawMatches}
                    onAdd={addMatch}
                    onUpdate={updateMatch}
                    editMatch={editMatch}
                    onEditDone={() => setEditMatch(null)}
                    lastMatch={matches.length > 0 ? matches[0] : null}
                  />
                )}
              </div>
            </div>
            {!isLeagueAuthorized ? (
              <Alert>
                <AlertDescription>
                  You need to authenticate with the league passcode to modify data.
                </AlertDescription>
              </Alert>
            ) : null}
            <MatchList
              matches={matches}
              players={players}
              onEdit={setEditMatch}
              onDelete={deleteMatch}
              eloDeltas={eloDeltas}
              canEdit={isLeagueAuthorized}
            />
          </div>
        )}
      </main>
    </div>
  );
}
