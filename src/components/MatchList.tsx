import { Match, Player, SURFACE_META } from '@/types/tennis';
import { MatchEloDelta } from '@/utils/eloDelta';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MoreHorizontal, Pencil, Trash2, Info } from 'lucide-react';

interface Props {
  matches: Match[];
  players: Player[];
  onEdit: (match: Match) => void;
  onDelete: (id: string) => void;
  eloDeltas: Record<string, MatchEloDelta>;
  canEdit?: boolean;
}

export function MatchList({ matches, players, onEdit, onDelete, eloDeltas, canEdit = true }: Props) {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  
  const playerName = (id: string) => {
    const name = players.find(p => p.id === id)?.name || '?';
    if (name.length > 10) return name.substring(0, 10);
    return name;
  };

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
          const isExpanded = expandedMatch === m.id;

          return (
            <div key={m.id}>
              <Tooltip open={isExpanded} onOpenChange={(open) => setExpandedMatch(open ? m.id : null)}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setExpandedMatch(isExpanded ? null : m.id)}
                    className="w-full text-left flex items-center gap-2 sm:gap-3 p-3 sm:p-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-colors animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {/* Date + surface */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground w-[4.5rem] sm:w-20">{m.date}</span>
                      {surface && (
                        <span className="text-xs" title={surface.label}>
                          {surface.emoji}
                        </span>
                      )}
                    </div>

                    {/* Players */}
                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                      <span className={`text-sm truncate ${aWon ? 'font-bold' : ''}`}>
                        {playerName(m.playerAId)}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">v</span>
                      <span className={`text-sm truncate ${bWon ? 'font-bold' : ''}`}>
                        {playerName(m.playerBId)}
                      </span>
                    </div>

                    {/* Score */}
                    <span className="font-display font-bold text-sm tabular-nums shrink-0">
                      {m.gamesA}–{m.gamesB}
                    </span>

                    {/* Info icon for mobile/click indication */}
                    <Info className="h-4 w-4 text-muted-foreground shrink-0" />

                    {/* Actions menu */}
                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover z-50">
                          <DropdownMenuItem onClick={() => { onEdit(m); setExpandedMatch(null); }}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => { onDelete(m.id); setExpandedMatch(null); }}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3">
                  <div className="space-y-2 text-xs">
                    <div className="font-semibold">
                      {playerName(m.playerAId)} vs {playerName(m.playerBId)}
                    </div>
                    {surface && (
                      <div>
                        <span className="text-muted-foreground">Court: </span>
                        <span>{surface.emoji} {surface.label}</span>
                      </div>
                    )}
                    {delta && (
                      <div>
                        <span className="text-muted-foreground">Expected winner: </span>
                        <span>
                          {delta.expectedA > 0.5 
                            ? playerName(m.playerAId) 
                            : playerName(m.playerBId)
                          }
                          {' '}
                          ({(Math.max(delta.expectedA, 1 - delta.expectedA) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
