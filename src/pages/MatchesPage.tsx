import { useState } from 'react';
import { Match } from '@/types/tennis';
import { useLeagueData } from '@/hooks/useLeagueData';
import { PlayerManager } from '@/components/PlayerManager';
import { MatchDialog } from '@/components/MatchDialog';
import { MatchList } from '@/components/MatchList';
import { BottomNav } from '@/components/BottomNav';

export default function MatchesPage() {
  const { players, matches, addPlayer, updatePlayer, deletePlayer, addMatch, updateMatch, deleteMatch } = useLeagueData();
  const [editMatch, setEditMatch] = useState<Match | null>(null);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between py-3">
          <h1 className="text-xl font-display font-bold tracking-tight">🎾 Matches</h1>
          <div className="flex gap-2">
            <PlayerManager players={players} onAdd={addPlayer} onUpdate={updatePlayer} onDelete={deletePlayer} />
            <MatchDialog
              players={players}
              onAdd={addMatch}
              onUpdate={updateMatch}
              editMatch={editMatch}
              onEditDone={() => setEditMatch(null)}
            />
          </div>
        </div>
      </header>
      <main className="container py-4">
        <MatchList matches={matches} players={players} onEdit={setEditMatch} onDelete={deleteMatch} />
      </main>
      <BottomNav />
    </div>
  );
}
