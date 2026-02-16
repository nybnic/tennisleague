import { Match, Player } from '@/types/tennis';

export interface PlayerTrend {
  playerId: string;
  wPctTrend: 'up' | 'down' | 'neutral';
  gPctTrend: 'up' | 'down' | 'neutral';
  eloTrend: 'up' | 'down' | 'neutral';
}

const RECENT_MATCHES = 3;

export function calculateTrends(players: Player[], matches: Match[]): Record<string, PlayerTrend> {
  const chrono = [...matches].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.createdAt.localeCompare(b.createdAt);
  });

  const result: Record<string, PlayerTrend> = {};

  for (const p of players) {
    const playerMatches = chrono.filter(m => m.playerAId === p.id || m.playerBId === p.id);
    if (playerMatches.length < 2) {
      result[p.id] = { playerId: p.id, wPctTrend: 'neutral', gPctTrend: 'neutral', eloTrend: 'neutral' };
      continue;
    }

    const recent = playerMatches.slice(-RECENT_MATCHES);
    const older = playerMatches.slice(0, -RECENT_MATCHES);

    const calc = (ms: Match[]) => {
      let mw = 0, total = 0, gf = 0, ga = 0;
      for (const m of ms) {
        const isA = m.playerAId === p.id;
        total++;
        gf += isA ? m.gamesA : m.gamesB;
        ga += isA ? m.gamesB : m.gamesA;
        const won = isA ? m.gamesA > m.gamesB : m.gamesB > m.gamesA;
        if (won) mw++;
      }
      return {
        wPct: total > 0 ? mw / total : 0,
        gPct: (gf + ga) > 0 ? gf / (gf + ga) : 0,
      };
    };

    const recentStats = calc(recent);
    const olderStats = older.length > 0 ? calc(older) : calc(playerMatches); // compare recent vs older

    // For Elo, compare current vs N matches ago
    // Recalculate elo history
    const elos: Record<string, number> = {};
    const eloHistory: number[] = [];
    for (const m of chrono) {
      if (!elos[m.playerAId]) elos[m.playerAId] = 1000;
      if (!elos[m.playerBId]) elos[m.playerBId] = 1000;
      const eA = elos[m.playerAId];
      const eB = elos[m.playerBId];
      let sA: number, sB: number;
      if (m.gamesA > m.gamesB) { sA = 1; sB = 0; }
      else if (m.gamesB > m.gamesA) { sA = 0; sB = 1; }
      else { sA = 0.5; sB = 0.5; }
      const expA = 1 / (1 + Math.pow(10, (eB - eA) / 400));
      elos[m.playerAId] = eA + 32 * (sA - expA);
      elos[m.playerBId] = eB + 32 * (sB - (1 - expA));
      if (m.playerAId === p.id || m.playerBId === p.id) {
        eloHistory.push(Math.round(elos[p.id]));
      }
    }

    const currentElo = eloHistory[eloHistory.length - 1] ?? 1000;
    const prevElo = eloHistory[Math.max(0, eloHistory.length - 1 - RECENT_MATCHES)] ?? 1000;

    const threshold = 0.02; // 2% threshold for W% and G%
    const eloThreshold = 5;

    const trend = (recent: number, old: number, thresh: number): 'up' | 'down' | 'neutral' => {
      const diff = recent - old;
      if (diff > thresh) return 'up';
      if (diff < -thresh) return 'down';
      return 'neutral';
    };

    result[p.id] = {
      playerId: p.id,
      wPctTrend: older.length > 0 ? trend(recentStats.wPct, olderStats.wPct, threshold) : 'neutral',
      gPctTrend: older.length > 0 ? trend(recentStats.gPct, olderStats.gPct, threshold) : 'neutral',
      eloTrend: trend(currentElo, prevElo, eloThreshold),
    };
  }

  return result;
}
