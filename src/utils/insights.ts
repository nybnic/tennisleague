import { Match, Player, Insight } from '@/types/tennis';

export function generateInsights(players: Player[], matches: Match[]): Insight[] {
  if (players.length === 0 || matches.length === 0) return [];

  const insights: Insight[] = [];
  const chronoMatches = [...matches].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.createdAt.localeCompare(b.createdAt);
  });

  const playerMap = Object.fromEntries(players.map(p => [p.id, p.name]));

  // Win streaks
  players.forEach(p => {
    let streak = 0;
    for (let i = chronoMatches.length - 1; i >= 0; i--) {
      const m = chronoMatches[i];
      if (m.playerAId !== p.id && m.playerBId !== p.id) continue;
      const won = (m.playerAId === p.id && m.gamesA > m.gamesB) ||
                  (m.playerBId === p.id && m.gamesB > m.gamesA);
      if (won) streak++;
      else break;
    }
    if (streak >= 2) {
      insights.push({
        text: `${p.name} is on a ${streak}-match win streak! 🔥`,
        playerName: p.name,
        type: 'streak',
      });
    }
  });

  // Best single game difference
  let bestDiff = 0;
  let bestDiffPlayer = '';
  let bestDiffMatch: Match | null = null;
  chronoMatches.forEach(m => {
    const diff = Math.abs(m.gamesA - m.gamesB);
    if (diff > bestDiff) {
      bestDiff = diff;
      bestDiffPlayer = m.gamesA > m.gamesB ? playerMap[m.playerAId] : playerMap[m.playerBId];
      bestDiffMatch = m;
    }
  });
  if (bestDiffMatch && bestDiffPlayer) {
    insights.push({
      text: `${bestDiffPlayer} holds the biggest win margin: ${bestDiffMatch.gamesA}-${bestDiffMatch.gamesB} 💪`,
      playerName: bestDiffPlayer,
      type: 'gameDiff',
    });
  }

  // Elo trend (biggest recent Elo gain over last 3 matches)
  const elos: Record<string, number[]> = {};
  const eloState: Record<string, number> = {};
  for (const m of chronoMatches) {
    if (!eloState[m.playerAId]) eloState[m.playerAId] = 1000;
    if (!eloState[m.playerBId]) eloState[m.playerBId] = 1000;
    const eA = eloState[m.playerAId];
    const eB = eloState[m.playerBId];
    let sA: number;
    if (m.gamesA > m.gamesB) sA = 1;
    else if (m.gamesB > m.gamesA) sA = 0;
    else sA = 0.5;
    const expA = 1 / (1 + Math.pow(10, (eB - eA) / 400));
    eloState[m.playerAId] = eA + 32 * (sA - expA);
    eloState[m.playerBId] = eB + 32 * ((1 - sA) - (1 - expA));

    [m.playerAId, m.playerBId].forEach(pid => {
      if (!elos[pid]) elos[pid] = [];
      elos[pid].push(Math.round(eloState[pid]));
    });
  }

  let bestRise = 0;
  let risingPlayer = '';
  Object.entries(elos).forEach(([pid, history]) => {
    if (history.length >= 3) {
      const rise = history[history.length - 1] - history[history.length - 3];
      if (rise > bestRise) {
        bestRise = rise;
        risingPlayer = playerMap[pid] || '';
      }
    }
  });
  if (risingPlayer && bestRise > 10) {
    insights.push({
      text: `${risingPlayer} is climbing fast — Elo up ${bestRise} pts in recent matches 📈`,
      playerName: risingPlayer,
      type: 'elo',
    });
  }

  // Most games played
  const gamesPlayed: Record<string, number> = {};
  chronoMatches.forEach(m => {
    gamesPlayed[m.playerAId] = (gamesPlayed[m.playerAId] || 0) + 1;
    gamesPlayed[m.playerBId] = (gamesPlayed[m.playerBId] || 0) + 1;
  });
  const mostActive = Object.entries(gamesPlayed).sort((a, b) => b[1] - a[1])[0];
  if (mostActive && playerMap[mostActive[0]]) {
    insights.push({
      text: `${playerMap[mostActive[0]]} leads with ${mostActive[1]} matches played — true competitor! 🏆`,
      playerName: playerMap[mostActive[0]],
      type: 'other',
    });
  }

  // Closest rivalry
  const rivalries: Record<string, { count: number; aName: string; bName: string }> = {};
  chronoMatches.forEach(m => {
    const key = [m.playerAId, m.playerBId].sort().join('-');
    if (!rivalries[key]) rivalries[key] = { count: 0, aName: playerMap[m.playerAId], bName: playerMap[m.playerBId] };
    rivalries[key].count++;
  });
  const topRivalry = Object.values(rivalries).sort((a, b) => b.count - a.count)[0];
  if (topRivalry && topRivalry.count >= 2) {
    insights.push({
      text: `${topRivalry.aName} vs ${topRivalry.bName} — ${topRivalry.count} matches and counting! 🎾`,
      playerName: topRivalry.aName,
      type: 'other',
    });
  }

  // Shuffle and pick 2
  const shuffled = insights.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}
