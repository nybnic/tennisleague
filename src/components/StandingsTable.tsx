import { useState } from 'react';
import { PlayerStanding } from '@/types/tennis';
import { PlayerTrend } from '@/utils/trends';
import { PlayerTooltipData } from '@/utils/playerTooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  standings: PlayerStanding[];
  trends?: Record<string, PlayerTrend>;
  tooltips?: Record<string, PlayerTooltipData>;
}

function TrendIcon({ direction }: { direction: 'up' | 'down' | 'neutral' }) {
  if (direction === 'up') return <TrendingUp className="inline h-3 w-3 text-green-500 ml-0.5" />;
  if (direction === 'down') return <TrendingDown className="inline h-3 w-3 text-red-500 ml-0.5" />;
  return <Minus className="inline h-3 w-3 text-muted-foreground ml-0.5" />;
}

export function StandingsTable({ standings, trends, tooltips }: Props) {
  const [openPlayer, setOpenPlayer] = useState<string | null>(null);

  if (standings.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No standings data yet</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-display">#</TableHead>
            <TableHead className="font-display">Player</TableHead>
            <TableHead className="font-display text-center">M</TableHead>
            <TableHead className="font-display text-center">W</TableHead>
            <TableHead className="font-display text-center">D</TableHead>
            <TableHead className="font-display text-center">L</TableHead>
            <TableHead className="font-display text-center">W%</TableHead>
            <TableHead className="font-display text-center">GF</TableHead>
            <TableHead className="font-display text-center">GA</TableHead>
            <TableHead className="font-display text-center">G%</TableHead>
            <TableHead className="font-display text-center">Elo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((s, i) => {
            const t = trends?.[s.playerId];
            const tip = tooltips?.[s.playerId];
            const isOpen = openPlayer === s.playerId;
            return (
              <TableRow key={s.playerId} className={i === 0 && s.matches > 0 ? 'bg-primary/5' : ''}>
                <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">
                  {tip && s.matches > 0 ? (
                    <Popover open={isOpen} onOpenChange={(open) => setOpenPlayer(open ? s.playerId : null)}>
                      <PopoverTrigger asChild>
                        <button
                          className="cursor-pointer underline decoration-dotted underline-offset-2 decoration-muted-foreground/40 hover:text-foreground/80 text-left"
                        >
                          {s.playerName}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 text-xs space-y-2 p-3">
                        {tip.bestOpponent && (
                          <p><span className="text-muted-foreground">Best vs:</span> {tip.bestOpponent}</p>
                        )}
                        {tip.worstOpponent && (
                          <p><span className="text-muted-foreground">Worst vs:</span> {tip.worstOpponent}</p>
                        )}
                        <p><span className="text-muted-foreground">Avg score:</span> {tip.avgGamesFor}–{tip.avgGamesAgainst}</p>
                        <p><span className="text-muted-foreground">Streak:</span> {tip.currentStreak}</p>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    s.playerName
                  )}
                </TableCell>
                  <TableCell className="text-center tabular-nums">{s.matches}</TableCell>
                  <TableCell className="text-center tabular-nums font-semibold">{s.matchesWon}</TableCell>
                  <TableCell className="text-center tabular-nums">{s.matchesDrawn}</TableCell>
                  <TableCell className="text-center tabular-nums">{s.matchesLost}</TableCell>
                  <TableCell className="text-center tabular-nums">
                    {s.matchesWonPct.toFixed(0)}%
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{s.gamesFor}</TableCell>
                  <TableCell className="text-center tabular-nums">{s.gamesAgainst}</TableCell>
                  <TableCell className="text-center tabular-nums">
                    {s.gamesWonPct.toFixed(0)}%
                  </TableCell>
                  <TableCell className="text-center tabular-nums font-bold">
                    {s.elo}{t && <TrendIcon direction={t.eloTrend} />}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
