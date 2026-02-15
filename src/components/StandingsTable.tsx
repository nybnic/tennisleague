import { PlayerStanding } from '@/types/tennis';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
  standings: PlayerStanding[];
}

export function StandingsTable({ standings }: Props) {
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
          {standings.map((s, i) => (
            <TableRow key={s.playerId} className={i === 0 && s.matches > 0 ? 'bg-primary/5' : ''}>
              <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium">{s.playerName}</TableCell>
              <TableCell className="text-center tabular-nums">{s.matches}</TableCell>
              <TableCell className="text-center tabular-nums font-semibold">{s.matchesWon}</TableCell>
              <TableCell className="text-center tabular-nums">{s.matchesDrawn}</TableCell>
              <TableCell className="text-center tabular-nums">{s.matchesLost}</TableCell>
              <TableCell className="text-center tabular-nums">{s.matchesWonPct.toFixed(0)}%</TableCell>
              <TableCell className="text-center tabular-nums">{s.gamesFor}</TableCell>
              <TableCell className="text-center tabular-nums">{s.gamesAgainst}</TableCell>
              <TableCell className="text-center tabular-nums">{s.gamesWonPct.toFixed(0)}%</TableCell>
              <TableCell className="text-center tabular-nums font-bold">{s.elo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
