import { Match, Player } from '@/types/tennis';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  matches: Match[];
  players: Player[];
  onEdit: (match: Match) => void;
  onDelete: (id: string) => void;
}

export function MatchList({ matches, players, onEdit, onDelete }: Props) {
  const playerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-display">No matches yet</p>
        <p className="text-sm mt-1">Add players and start recording matches</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {matches.map((m, i) => {
        const aWon = m.gamesA > m.gamesB;
        const bWon = m.gamesB > m.gamesA;
        return (
          <div
            key={m.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border animate-fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <span className="text-xs text-muted-foreground w-20 shrink-0">{m.date}</span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className={`text-sm truncate ${aWon ? 'font-bold' : ''}`}>{playerName(m.playerAId)}</span>
              <span className="text-xs text-muted-foreground">vs</span>
              <span className={`text-sm truncate ${bWon ? 'font-bold' : ''}`}>{playerName(m.playerBId)}</span>
            </div>
            <span className="font-display font-bold text-sm tabular-nums">
              {m.gamesA} - {m.gamesB}
            </span>
            <div className="flex gap-0.5 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(m)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(m.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
