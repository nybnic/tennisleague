import { Match, Player } from '@/types/tennis';

export interface MatchEloDelta {
  matchId: string;
  eloABefore: number;
  eloBBefore: number;
  deltaA: number;
  deltaB: number;
  expectedA: number;
}

/**
 * Calculate per-match Elo deltas by replaying all matches chronologically.
 */
export function calculateEloDeltas(players: Player[], matches: Match[]): Record<string, MatchEloDelta> {
  const chronoMatches = [...matches].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.createdAt.localeCompare(b.createdAt);
  });

  const elos: Record<string, number> = {};
  players.forEach(p => { elos[p.id] = 1000; });

  const result: Record<string, MatchEloDelta> = {};

  for (const m of chronoMatches) {
    if (!elos[m.playerAId]) elos[m.playerAId] = 1000;
    if (!elos[m.playerBId]) elos[m.playerBId] = 1000;

    const eA = elos[m.playerAId];
    const eB = elos[m.playerBId];
    const expectedA = 1 / (1 + Math.pow(10, (eB - eA) / 400));

    let sA: number, sB: number;
    if (m.gamesA > m.gamesB) { sA = 1; sB = 0; }
    else if (m.gamesB > m.gamesA) { sA = 0; sB = 1; }
    else { sA = 0.5; sB = 0.5; }

    const deltaA = 32 * (sA - expectedA);
    const deltaB = 32 * (sB - (1 - expectedA));

    elos[m.playerAId] = eA + deltaA;
    elos[m.playerBId] = eB + deltaB;

    result[m.id] = {
      matchId: m.id,
      eloABefore: Math.round(eA),
      eloBBefore: Math.round(eB),
      deltaA: Math.round(deltaA),
      deltaB: Math.round(deltaB),
      expectedA: expectedA,
    };
  }

  return result;
}
