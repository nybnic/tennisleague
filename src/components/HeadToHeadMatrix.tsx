import { useState } from 'react';
import { Player, HeadToHeadRecord, Match, getPlayerColor, SURFACE_META } from '@/types/tennis';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  players: Player[];
  h2h: Record<string, Record<string, HeadToHeadRecord>>;
  playerIndexMap: Record<string, number>;
  matches: Match[];
}

interface H2HDetail {
  totalMatches: number;
  wins: number;
  losses: number;
  totalGamesFor: number;
  totalGamesAgainst: number;
  surfaceBreakdown: Record<string, { matches: number; wins: number; losses: number }>;
  closestMatch: { gamesFor: number; gamesAgainst: number; date: string } | null;
  largestDifference: { gamesFor: number; gamesAgainst: number; date: string; diff: number } | null;
  winProbability: number;
  playerAElo: number;
  playerBElo: number;
}

export function HeadToHeadMatrix({ players, h2h, playerIndexMap, matches }: Props) {
  const [openCell, setOpenCell] = useState<string | null>(null);

  if (players.length < 2) return null;

  function getH2HDetails(playerAId: string, playerBId: string): H2HDetail {
    const record = h2h[playerAId]?.[playerBId];
    if (!record) {
      return {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        totalGamesFor: 0,
        totalGamesAgainst: 0,
        surfaceBreakdown: {},
        closestMatch: null,
        largestDifference: null,
        winProbability: 50,
        playerAElo: 1000,
        playerBElo: 1000,
      };
    }

    // Find relevant matches
    const rivalry = matches.filter(
      m => (m.playerAId === playerAId && m.playerBId === playerBId) ||
           (m.playerAId === playerBId && m.playerBId === playerAId)
    );

    // Surface breakdown
    const surfaceBreakdown: Record<string, { matches: number; wins: number; losses: number }> = {};
    rivalry.forEach(m => {
      const surface = m.surface || 'unknown';
      if (!surfaceBreakdown[surface]) {
        surfaceBreakdown[surface] = { matches: 0, wins: 0, losses: 0 };
      }
      surfaceBreakdown[surface].matches++;
      const playerAWon = m.playerAId === playerAId ? m.gamesA > m.gamesB : m.gamesB > m.gamesA;
      if (playerAWon) {
        surfaceBreakdown[surface].wins++;
      } else {
        surfaceBreakdown[surface].losses++;
      }
    });

    // Closest and largest matches with scores and dates
    let closestMatch: { gamesFor: number; gamesAgainst: number; date: string } | null = null;
    let largestDifference: { gamesFor: number; gamesAgainst: number; date: string; diff: number } | null = null;
    
    rivalry.forEach(m => {
      const isPlayerA = m.playerAId === playerAId;
      const playerAGames = isPlayerA ? m.gamesA : m.gamesB;
      const playerBGames = isPlayerA ? m.gamesB : m.gamesA;
      const diff = Math.abs(playerAGames - playerBGames);

      if (closestMatch === null || diff < Math.abs(closestMatch.gamesFor - closestMatch.gamesAgainst)) {
        closestMatch = { gamesFor: playerAGames, gamesAgainst: playerBGames, date: m.date };
      }
      if (largestDifference === null || diff > largestDifference.diff) {
        largestDifference = { gamesFor: playerAGames, gamesAgainst: playerBGames, date: m.date, diff };
      }
    });

    // Calculate Elo ratings for both players from all matches
    const allChronoMatches = [...matches].sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      return d !== 0 ? d : a.createdAt.localeCompare(b.createdAt);
    });

    const elos: Record<string, number> = {};
    allChronoMatches.forEach(m => {
      if (!elos[m.playerAId]) elos[m.playerAId] = 1000;
      if (!elos[m.playerBId]) elos[m.playerBId] = 1000;

      const eA = elos[m.playerAId];
      const eB = elos[m.playerBId];
      let sA: number;
      if (m.gamesA > m.gamesB) sA = 1;
      else if (m.gamesB > m.gamesA) sA = 0;
      else sA = 0.5;
      const expA = 1 / (1 + Math.pow(10, (eB - eA) / 400));
      elos[m.playerAId] = eA + 32 * (sA - expA);
      elos[m.playerBId] = eB + 32 * ((1 - sA) - (1 - expA));
    });

    const playerAElo = Math.round(elos[playerAId] || 1000);
    const playerBElo = Math.round(elos[playerBId] || 1000);

    // Elo-based win probability
    const expA = 1 / (1 + Math.pow(10, (playerBElo - playerAElo) / 400));
    const winProbability = expA * 100;

    return {
      totalMatches: record.wins + record.losses + record.draws,
      wins: record.wins,
      losses: record.losses,
      totalGamesFor: record.gamesFor,
      totalGamesAgainst: record.gamesAgainst,
      surfaceBreakdown,
      closestMatch,
      largestDifference,
      winProbability,
      playerAElo,
      playerBElo,
    };
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <table className="text-xs md:text-sm w-full">
        <thead>
          <tr>
            <th className="p-2 md:p-3 text-left font-display min-w-[70px] md:min-w-[100px]">H2H</th>
            {players.map(p => (
              <th key={p.id} className="p-2 md:p-3 text-center font-display min-w-[60px] md:min-w-[100px]" style={{ color: getPlayerColor(playerIndexMap[p.id]) }} title={p.name}>
                <span className="hidden sm:inline">{p.name}</span>
                <span className="sm:hidden text-[11px] font-medium">{p.name.substring(0, 3)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map(p => (
            <tr key={p.id}>
              <td className="p-2 md:p-3 font-medium min-w-[70px] md:min-w-[100px] text-xs md:text-sm" style={{ color: getPlayerColor(playerIndexMap[p.id]) }} title={p.name}>
                <span className="hidden sm:inline">{p.name}</span>
                <span className="sm:hidden text-[11px]">{p.name.substring(0, 3)}</span>
              </td>
              {players.map(q => {
                if (p.id === q.id) {
                  return <td key={q.id} className="p-2 md:p-3 text-center bg-muted/30 text-xs md:text-sm">—</td>;
                }
                const record = h2h[p.id]?.[q.id];
                if (!record) return <td key={q.id} className="p-2 md:p-3 text-center text-xs md:text-sm">-</td>;
                const total = record.wins + record.losses + record.draws;
                if (total === 0) return <td key={q.id} className="p-2 md:p-3 text-center text-muted-foreground text-xs md:text-sm">0-0</td>;
                
                const cellKey = `${p.id}-${q.id}`;
                const isOpen = openCell === cellKey;
                const details = getH2HDetails(p.id, q.id);

                return (
                  <td key={q.id} className="p-2 md:p-3 text-center">
                    <Popover open={isOpen} onOpenChange={(open) => setOpenCell(open ? cellKey : null)}>
                      <PopoverTrigger asChild>
                        <button className="cursor-pointer hover:text-primary transition-colors text-xs md:text-sm font-medium">
                          {record.wins}-{record.losses}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 text-xs space-y-3 p-3">
                        <div>
                          <p className="font-bold text-sm">{p.name} vs {q.name}</p>
                        </div>
                        
                        <div className="border-t border-border pt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Matches:</span>
                            <span className="font-semibold">{details.totalMatches}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Record:</span>
                            <span className="font-semibold">{details.wins}W - {details.losses}L</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Games:</span>
                            <span className="font-semibold">{details.totalGamesFor}-{details.totalGamesAgainst}</span>
                          </div>
                        </div>

                        {Object.keys(details.surfaceBreakdown).length > 1 && (
                          <div className="border-t border-border pt-2 space-y-1">
                            <p className="font-semibold text-muted-foreground">By Surface:</p>
                            {Object.entries(details.surfaceBreakdown).map(([surface, stats]) => (
                              <div key={surface} className="flex justify-between text-xs">
                                <span>{SURFACE_META[surface as any]?.emoji || '•'} {SURFACE_META[surface as any]?.label || surface}</span>
                                <span>{stats.wins}W-{stats.losses}L</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {details.closestMatch && (
                          <div className="border-t border-border pt-2">
                            <p className="text-muted-foreground text-xs">
                              <span className="font-semibold">Closest match:</span> {details.closestMatch.gamesFor}-{details.closestMatch.gamesAgainst} ({details.closestMatch.date})
                            </p>
                          </div>
                        )}

                        {details.largestDifference && details.largestDifference.diff !== Math.abs(details.closestMatch?.gamesFor ?? 0 - (details.closestMatch?.gamesAgainst ?? 0)) && (
                          <div>
                            <p className="text-muted-foreground text-xs">
                              <span className="font-semibold">Largest win margin:</span> {details.largestDifference.gamesFor}-{details.largestDifference.gamesAgainst} ({details.largestDifference.date})
                            </p>
                          </div>
                        )}

                        <div className="border-t border-border pt-2 space-y-1">
                          <p className="text-muted-foreground text-xs">
                            <span className="font-semibold">{p.name}</span> Elo: {details.playerAElo}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            <span className="font-semibold">{q.name}</span> Elo: {details.playerBElo}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            <span className="font-semibold">{p.name}</span> Win Probability: <span className="font-semibold text-foreground">{Math.round(details.winProbability)}%</span>
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
