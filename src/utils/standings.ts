import { Match, Player, PlayerStanding, HeadToHeadRecord, HistoryPoint } from '@/types/tennis';

export function calculateStandings(players: Player[], matches: Match[]): PlayerStanding[] {
  // Sort matches chronologically for Elo calculation
  const chronoMatches = [...matches].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.createdAt.localeCompare(b.createdAt);
  });

  const elos: Record<string, number> = {};
  const stats: Record<string, { mw: number; md: number; ml: number; gf: number; ga: number }> = {};

  players.forEach(p => {
    elos[p.id] = 1000;
    stats[p.id] = { mw: 0, md: 0, ml: 0, gf: 0, ga: 0 };
  });

  for (const m of chronoMatches) {
    const sa = stats[m.playerAId];
    const sb = stats[m.playerBId];
    if (!sa || !sb) continue;

    sa.gf += m.gamesA;
    sa.ga += m.gamesB;
    sb.gf += m.gamesB;
    sb.ga += m.gamesA;

    let scoreA: number, scoreB: number;
    if (m.gamesA > m.gamesB) {
      sa.mw++; sb.ml++;
      scoreA = 1; scoreB = 0;
    } else if (m.gamesB > m.gamesA) {
      sb.mw++; sa.ml++;
      scoreA = 0; scoreB = 1;
    } else {
      sa.md++; sb.md++;
      scoreA = 0.5; scoreB = 0.5;
    }

    // Elo update
    const eA = elos[m.playerAId];
    const eB = elos[m.playerBId];
    const expectedA = 1 / (1 + Math.pow(10, (eB - eA) / 400));
    const expectedB = 1 - expectedA;
    elos[m.playerAId] = eA + 32 * (scoreA - expectedA);
    elos[m.playerBId] = eB + 32 * (scoreB - expectedB);
  }

  return players.map(p => {
    const s = stats[p.id];
    const totalMatches = s.mw + s.md + s.ml;
    const totalGames = s.gf + s.ga;
    return {
      playerId: p.id,
      playerName: p.name,
      matches: totalMatches,
      matchesWon: s.mw,
      matchesDrawn: s.md,
      matchesLost: s.ml,
      matchesWonPct: totalMatches > 0 ? (s.mw / totalMatches) * 100 : 0,
      gamesFor: s.gf,
      gamesAgainst: s.ga,
      gamesWonPct: totalGames > 0 ? (s.gf / totalGames) * 100 : 0,
      elo: Math.round(elos[p.id]),
    };
  }).sort((a, b) => b.matchesWon - a.matchesWon || b.elo - a.elo);
}

export function calculateHeadToHead(
  players: Player[],
  matches: Match[]
): Record<string, Record<string, HeadToHeadRecord>> {
  const h2h: Record<string, Record<string, HeadToHeadRecord>> = {};
  players.forEach(p => {
    h2h[p.id] = {};
    players.forEach(q => {
      if (p.id !== q.id) h2h[p.id][q.id] = { wins: 0, losses: 0, draws: 0, gamesFor: 0, gamesAgainst: 0 };
    });
  });

  for (const m of matches) {
    if (!h2h[m.playerAId]?.[m.playerBId]) continue;
    h2h[m.playerAId][m.playerBId].gamesFor += m.gamesA;
    h2h[m.playerAId][m.playerBId].gamesAgainst += m.gamesB;
    h2h[m.playerBId][m.playerAId].gamesFor += m.gamesB;
    h2h[m.playerBId][m.playerAId].gamesAgainst += m.gamesA;
    if (m.gamesA > m.gamesB) {
      h2h[m.playerAId][m.playerBId].wins++;
      h2h[m.playerBId][m.playerAId].losses++;
    } else if (m.gamesB > m.gamesA) {
      h2h[m.playerAId][m.playerBId].losses++;
      h2h[m.playerBId][m.playerAId].wins++;
    } else {
      h2h[m.playerAId][m.playerBId].draws++;
      h2h[m.playerBId][m.playerAId].draws++;
    }
  }
  return h2h;
}

export function calculateHistory(playerId: string, matches: Match[]): HistoryPoint[] {
  const chronoMatches = [...matches]
    .filter(m => m.playerAId === playerId || m.playerBId === playerId)
    .sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      return d !== 0 ? d : a.createdAt.localeCompare(b.createdAt);
    });

  let elo = 1000;
  let mw = 0, total = 0, gf = 0, ga = 0;
  const points: HistoryPoint[] = [];

  // We need opponent Elo tracking for accurate history - simplified: use 1000 base
  // For accurate Elo, we'd need full recalculation. Simplified approach:
  const allChronoMatches = [...matches].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.createdAt.localeCompare(b.createdAt);
  });

  const elos: Record<string, number> = {};
  for (const m of allChronoMatches) {
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

    if (m.playerAId === playerId || m.playerBId === playerId) {
      const isA = m.playerAId === playerId;
      total++;
      gf += isA ? m.gamesA : m.gamesB;
      ga += isA ? m.gamesB : m.gamesA;
      const won = isA ? m.gamesA > m.gamesB : m.gamesB > m.gamesA;
      if (won) mw++;

      points.push({
        matchIndex: total,
        matchesWonPct: (mw / total) * 100,
        gamesWonPct: ((gf) / (gf + ga)) * 100,
        elo: Math.round(elos[playerId]),
      });
    }
  }

  return points;
}
