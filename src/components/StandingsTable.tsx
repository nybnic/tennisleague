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
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 rounded-lg border border-border">
      <Table className="text-xs md:text-sm">
        <TableHeader>
          <TableRow className="bg-muted/50 sticky top-0">
            <TableHead className="font-display sticky left-0 z-20 bg-muted/50 p-2 md:p-3 min-w-[35px] text-center">#</TableHead>
            <TableHead className="font-display sticky left-[51px] md:left-[59px] z-20 bg-muted/50 p-2 md:p-3 min-w-[100px] text-left">Player</TableHead>
            <TableHead className="font-display text-center p-2 md:p-3 min-w-[45px]"><span className="hidden sm:inline">Matches</span><span className="sm:hidden">M</span></TableHead>
            <TableHead className="font-display text-center p-2 md:p-3 min-w-[40px]">W</TableHead>
            <TableHead className="font-display text-center p-2 md:p-3 min-w-[40px]">D</TableHead>
            <TableHead className="font-display text-center p-2 md:p-3 min-w-[40px]">L</TableHead>
            <TableHead className="font-display text-center p-2 md:p-3 min-w-[50px]">W%</TableHead>
            <TableHead className="font-display text-center p-2 md:p-3 min-w-[45px]"><span className="hidden sm:inline">GF</span><span className="sm:hidden">F</span></TableHead>
            <TableHead className="font-display text-center p-2 md:p-3 min-w-[45px]"><span className="hidden sm:inline">GA</span><span className="sm:hidden">A</span></TableHead>
            <TableHead className="font-display text-center p-2 md:p-3 min-w-[50px]">G%</TableHead>
            <TableHead className="font-display text-center p-2 md:p-3 min-w-[55px]">Elo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((s, i) => {
            const t = trends?.[s.playerId];
            const tip = tooltips?.[s.playerId];
            const isOpen = openPlayer === s.playerId;
            return (
              <TableRow key={s.playerId} className={i === 0 && s.matches > 0 ? 'bg-primary/5' : ''}>
                <TableCell className="font-bold text-muted-foreground sticky left-0 z-10 p-2 md:p-3 text-center text-xs md:text-sm min-w-[35px]" style={{ backgroundColor: i === 0 && s.matches > 0 ? 'hsl(var(--primary) / 0.05)' : 'transparent' }}>{i + 1}</TableCell>
                <TableCell className="font-medium sticky left-[51px] md:left-[59px] z-10 p-2 md:p-3 truncate text-xs md:text-sm min-w-[100px]" style={{ backgroundColor: i === 0 && s.matches > 0 ? 'hsl(var(--primary) / 0.05)' : 'transparent' }}>
                  {tip && s.matches > 0 ? (
                    <Popover open={isOpen} onOpenChange={(open) => setOpenPlayer(open ? s.playerId : null)}>
                      <PopoverTrigger asChild>
                        <button
                          className="cursor-pointer underline decoration-dotted underline-offset-2 decoration-muted-foreground/40 hover:text-foreground/80 text-left truncate"
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
                    <span className="truncate">{s.playerName}</span>
                  )}
                </TableCell>
                <TableCell className="text-center tabular-nums p-2 md:p-3 text-xs md:text-sm">{s.matches}</TableCell>
                <TableCell className="text-center tabular-nums font-semibold p-2 md:p-3 text-xs md:text-sm">{s.matchesWon}</TableCell>
                <TableCell className="text-center tabular-nums p-2 md:p-3 text-xs md:text-sm">{s.matchesDrawn}</TableCell>
                <TableCell className="text-center tabular-nums p-2 md:p-3 text-xs md:text-sm">{s.matchesLost}</TableCell>
                <TableCell className="text-center tabular-nums p-2 md:p-3 text-xs md:text-sm">
                  {s.matchesWonPct.toFixed(0)}%
                </TableCell>
                <TableCell className="text-center tabular-nums p-2 md:p-3 text-xs md:text-sm">{s.gamesFor}</TableCell>
                <TableCell className="text-center tabular-nums p-2 md:p-3 text-xs md:text-sm">{s.gamesAgainst}</TableCell>
                <TableCell className="text-center tabular-nums p-2 md:p-3 text-xs md:text-sm">
                  {s.gamesWonPct.toFixed(0)}%
                </TableCell>
                <TableCell className="text-center tabular-nums font-bold p-2 md:p-3 text-xs md:text-sm">
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
