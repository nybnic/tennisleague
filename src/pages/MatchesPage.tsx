import { useState, useMemo } from 'react';
import { Match } from '@/types/tennis';
import { useLeagueData } from '@/hooks/useLeagueData';
import { PlayerManager } from '@/components/PlayerManager';
import { MatchDialog } from '@/components/MatchDialog';
import { MatchList } from '@/components/MatchList';
import { BottomNav } from '@/components/BottomNav';
import { calculateEloDeltas } from '@/utils/eloDelta';

export default function MatchesPage() {
  const { players, matches, rawMatches, addPlayer, updatePlayer, deletePlayer, addMatch, updateMatch, deleteMatch, loading } = useLeagueData();
  const [editMatch, setEditMatch] = useState<Match | null>(null);

  const eloDeltas = useMemo(() => calculateEloDeltas(players, rawMatches), [players, rawMatches]);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between py-3">
          <h1 className="text-xl font-display font-bold tracking-tight">🎾 Matches</h1>
          <div className="flex gap-2">
            <PlayerManager players={players} onAdd={addPlayer} onUpdate={updatePlayer} onDelete={deletePlayer} />
            <MatchDialog
              players={players}
              matches={rawMatches}
              onAdd={addMatch}
              onUpdate={updateMatch}
              editMatch={editMatch}
              onEditDone={() => setEditMatch(null)}
              lastMatch={matches.length > 0 ? matches[0] : null}
            />
          </div>
        </div>
      </header>
      <main className="container py-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading matches...</div>
        ) : (
          <MatchList matches={matches} players={players} onEdit={setEditMatch} onDelete={deleteMatch} eloDeltas={eloDeltas} />
        )}
      </main>
      <BottomNav />
    </div>
  );
}
