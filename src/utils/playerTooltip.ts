import { Match, Player } from '@/types/tennis';

export interface PlayerTooltipData {
  bestOpponent: string | null;   // highest win% against
  worstOpponent: string | null;  // lowest win% against
  avgGamesFor: number;
  avgGamesAgainst: number;
  currentStreak: string;         // e.g. "W3" or "L2" or "D1"
}

export function calculatePlayerTooltips(
  players: Player[],
  matches: Match[]
): Record<string, PlayerTooltipData> {
  const nameMap = Object.fromEntries(players.map(p => [p.id, p.name]));
  const result: Record<string, PlayerTooltipData> = {};

  const chronoMatches = [...matches].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.createdAt.localeCompare(b.createdAt);
  });

  for (const player of players) {
    const pid = player.id;
    const playerMatches = chronoMatches.filter(
      m => m.playerAId === pid || m.playerBId === pid
    );

    if (playerMatches.length === 0) {
      result[pid] = {
        bestOpponent: null,
        worstOpponent: null,
        avgGamesFor: 0,
        avgGamesAgainst: 0,
        currentStreak: '-',
      };
      continue;
    }

    // Per-opponent record
    const oppStats: Record<string, { wins: number; total: number; gf: number; ga: number }> = {};
    let totalGF = 0;
    let totalGA = 0;

    for (const m of playerMatches) {
      const isA = m.playerAId === pid;
      const oppId = isA ? m.playerBId : m.playerAId;
      const gf = isA ? m.gamesA : m.gamesB;
      const ga = isA ? m.gamesB : m.gamesA;
      totalGF += gf;
      totalGA += ga;

      if (!oppStats[oppId]) oppStats[oppId] = { wins: 0, total: 0, gf: 0, ga: 0 };
      oppStats[oppId].total++;
      oppStats[oppId].gf += gf;
      oppStats[oppId].ga += ga;
      if (gf > ga) oppStats[oppId].wins++;
    }

    // Sort opponents: primary by W%, secondary by G% (games won ratio)
    const oppEntries = Object.entries(oppStats).map(([oppId, s]) => ({
      oppId,
      wPct: (s.wins / s.total) * 100,
      gPct: s.gf + s.ga > 0 ? (s.gf / (s.gf + s.ga)) * 100 : 50,
    }));

    oppEntries.sort((a, b) => b.wPct - a.wPct || b.gPct - a.gPct);

    // Best = first, worst = last; ensure they differ if possible
    let bestOpp: string | null = null;
    let worstOpp: string | null = null;

    if (oppEntries.length >= 2) {
      bestOpp = oppEntries[0].oppId;
      worstOpp = oppEntries[oppEntries.length - 1].oppId;
    } else if (oppEntries.length === 1) {
      // Only one opponent — show as best, no worst
      bestOpp = oppEntries[0].oppId;
    }

    // Current streak
    let streakType: 'W' | 'L' | 'D' = 'D';
    let streakCount = 0;
    for (let i = playerMatches.length - 1; i >= 0; i--) {
      const m = playerMatches[i];
      const isA = m.playerAId === pid;
      const gf = isA ? m.gamesA : m.gamesB;
      const ga = isA ? m.gamesB : m.gamesA;
      const type: 'W' | 'L' | 'D' = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
      if (i === playerMatches.length - 1) {
        streakType = type;
        streakCount = 1;
      } else if (type === streakType) {
        streakCount++;
      } else {
        break;
      }
    }

    result[pid] = {
      bestOpponent: bestOpp ? nameMap[bestOpp] ?? null : null,
      worstOpponent: worstOpp ? nameMap[worstOpp] ?? null : null,
      avgGamesFor: +(totalGF / playerMatches.length).toFixed(1),
      avgGamesAgainst: +(totalGA / playerMatches.length).toFixed(1),
      currentStreak: `${streakType}${streakCount}`,
    };
  }

  return result;
}
