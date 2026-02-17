import { Match, Player, SURFACE_META } from '@/types/tennis';
import { MatchEloDelta } from '@/utils/eloDelta';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface Props {
  matches: Match[];
  players: Player[];
  onEdit: (match: Match) => void;
  onDelete: (id: string) => void;
  eloDeltas: Record<string, MatchEloDelta>;
}

export function MatchList({ matches, players, onEdit, onDelete, eloDeltas }: Props) {
  const playerName = (id: string) => players.find(p => p.id === id)?.name || '?';

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-display">No matches yet</p>
        <p className="text-sm mt-1">Add players and start recording matches</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-2">
        {matches.map((m, i) => {
          const aWon = m.gamesA > m.gamesB;
          const bWon = m.gamesB > m.gamesA;
          const delta = eloDeltas[m.id];
          const surface = m.surface ? SURFACE_META[m.surface] : null;

          return (
            <div
              key={m.id}
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-3 rounded-lg bg-card border border-border animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* Date + surface */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-muted-foreground w-[4.5rem] sm:w-20">{m.date}</span>
                {surface && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs cursor-default">{surface.emoji}</span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">{surface.label} court</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Players */}
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <span className={`text-sm truncate ${aWon ? 'font-bold' : ''}`}>{playerName(m.playerAId)}</span>
                <span className="text-xs text-muted-foreground">v</span>
                <span className={`text-sm truncate ${bWon ? 'font-bold' : ''}`}>{playerName(m.playerBId)}</span>
              </div>

              {/* Score */}
              <span className="font-display font-bold text-sm tabular-nums shrink-0">
                {m.gamesA}–{m.gamesB}
              </span>

              {/* Elo delta badge */}
              {delta && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 font-mono shrink-0 cursor-default ${
                        delta.deltaA > 0
                          ? 'text-primary border-primary/30'
                          : delta.deltaA < 0
                          ? 'text-destructive border-destructive/30'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {delta.deltaA > 0 ? '+' : ''}{delta.deltaA}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs space-y-1">
                    <p>Elo gap before: <strong>{Math.abs(delta.eloABefore - delta.eloBBefore)}</strong> pts</p>
                    <p>Expected win for {playerName(m.playerAId)}: <strong>{(delta.expectedA * 100).toFixed(0)}%</strong></p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover z-50">
                  <DropdownMenuItem onClick={() => onEdit(m)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(m.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
