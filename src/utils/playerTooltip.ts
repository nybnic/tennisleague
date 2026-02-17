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
    const oppStats: Record<string, { wins: number; total: number }> = {};
    let totalGF = 0;
    let totalGA = 0;

    for (const m of playerMatches) {
      const isA = m.playerAId === pid;
      const oppId = isA ? m.playerBId : m.playerAId;
      const gf = isA ? m.gamesA : m.gamesB;
      const ga = isA ? m.gamesB : m.gamesA;
      totalGF += gf;
      totalGA += ga;

      if (!oppStats[oppId]) oppStats[oppId] = { wins: 0, total: 0 };
      oppStats[oppId].total++;
      if (gf > ga) oppStats[oppId].wins++;
    }

    // Best/worst opponent (min 1 match)
    let bestOpp: string | null = null;
    let bestPct = -1;
    let worstOpp: string | null = null;
    let worstPct = 101;

    for (const [oppId, s] of Object.entries(oppStats)) {
      const pct = (s.wins / s.total) * 100;
      if (pct > bestPct || (pct === bestPct && s.total > (oppStats[bestOpp!]?.total ?? 0))) {
        bestPct = pct;
        bestOpp = oppId;
      }
      if (pct < worstPct || (pct === worstPct && s.total > (oppStats[worstOpp!]?.total ?? 0))) {
        worstPct = pct;
        worstOpp = oppId;
      }
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
