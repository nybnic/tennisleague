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

  // A: Perfect Record (100% win rate with 3+ matches)
  players.forEach(p => {
    let wins = 0;
    let total = 0;
    chronoMatches.forEach(m => {
      if (m.playerAId === p.id || m.playerBId === p.id) {
        total++;
        const won = (m.playerAId === p.id && m.gamesA > m.gamesB) ||
                    (m.playerBId === p.id && m.gamesB > m.gamesA);
        if (won) wins++;
      }
    });
    if (total >= 3 && wins === total) {
      insights.push({
        text: `${p.name} is undefeated with a perfect 100% record! 👑`,
        playerName: p.name,
        type: 'other',
      });
    }
  });

  // C: Biggest Upset (lower Elo player beats higher Elo player)
  let biggestUpset = { player: '', opponent: '', eloDiff: 0 };
  const eloStateForUpset: Record<string, number> = {};
  for (const m of chronoMatches) {
    if (!eloStateForUpset[m.playerAId]) eloStateForUpset[m.playerAId] = 1000;
    if (!eloStateForUpset[m.playerBId]) eloStateForUpset[m.playerBId] = 1000;
    const eA = eloStateForUpset[m.playerAId];
    const eB = eloStateForUpset[m.playerBId];
    let sA: number;
    if (m.gamesA > m.gamesB) sA = 1;
    else if (m.gamesB > m.gamesA) sA = 0;
    else sA = 0.5;

    // Check for upset before updating Elo
    if (sA === 1 && eA < eB) {
      const diff = eB - eA;
      if (diff > biggestUpset.eloDiff) {
        biggestUpset = { player: playerMap[m.playerAId], opponent: playerMap[m.playerBId], eloDiff: diff };
      }
    } else if (sA === 0 && eB < eA) {
      const diff = eA - eB;
      if (diff > biggestUpset.eloDiff) {
        biggestUpset = { player: playerMap[m.playerBId], opponent: playerMap[m.playerAId], eloDiff: diff };
      }
    }

    const expA = 1 / (1 + Math.pow(10, (eB - eA) / 400));
    eloStateForUpset[m.playerAId] = eA + 32 * (sA - expA);
    eloStateForUpset[m.playerBId] = eB + 32 * ((1 - sA) - (1 - expA));
  }
  if (biggestUpset.eloDiff > 30) {
    insights.push({
      text: `${biggestUpset.player} pulled off a massive upset, defeating ${biggestUpset.opponent} who was ${Math.round(biggestUpset.eloDiff)} Elo points higher! 🎯`,
      playerName: biggestUpset.player,
      type: 'other',
    });
  }

  // D: Lopsided Head-to-Head (one player dominates rivalry)
  let mostDominant = { player: '', opponent: '', wins: 0, losses: 0 };
  Object.entries(rivalries).forEach(([key, rivalry]) => {
    const ids = key.split('-');
    const [pid1, pid2] = ids;
    let p1Wins = 0, p2Wins = 0;
    chronoMatches.forEach(m => {
      if ((m.playerAId === pid1 && m.playerBId === pid2) || 
          (m.playerAId === pid2 && m.playerBId === pid1)) {
        if (m.playerAId === pid1 && m.gamesA > m.gamesB) p1Wins++;
        else if (m.playerAId === pid2 && m.gamesA > m.gamesB) p2Wins++;
      }
    });
    if (p1Wins > p2Wins + 1 && (p1Wins > mostDominant.wins || (p1Wins === mostDominant.wins && p2Wins < mostDominant.losses))) {
      mostDominant = { player: playerMap[pid1], opponent: playerMap[pid2], wins: p1Wins, losses: p2Wins };
    } else if (p2Wins > p1Wins + 1 && (p2Wins > mostDominant.wins || (p2Wins === mostDominant.wins && p1Wins < mostDominant.losses))) {
      mostDominant = { player: playerMap[pid2], opponent: playerMap[pid1], wins: p2Wins, losses: p1Wins };
    }
  });
  if (mostDominant.wins > 0 && mostDominant.losses === 0) {
    insights.push({
      text: `${mostDominant.player} dominates ${mostDominant.opponent} ${mostDominant.wins}-0 in head-to-head! 💪`,
      playerName: mostDominant.player,
      type: 'other',
    });
  }

  // E: Most Improved (biggest total Elo change from start to end)
  const totalEloChange: Record<string, { start: number; end: number }> = {};
  const eloStateForImprovement: Record<string, number> = {};
  for (const m of chronoMatches) {
    if (!eloStateForImprovement[m.playerAId]) {
      eloStateForImprovement[m.playerAId] = 1000;
      totalEloChange[m.playerAId] = { start: 1000, end: 1000 };
    }
    if (!eloStateForImprovement[m.playerBId]) {
      eloStateForImprovement[m.playerBId] = 1000;
      totalEloChange[m.playerBId] = { start: 1000, end: 1000 };
    }
    const eA = eloStateForImprovement[m.playerAId];
    const eB = eloStateForImprovement[m.playerBId];
    let sA: number;
    if (m.gamesA > m.gamesB) sA = 1;
    else if (m.gamesB > m.gamesA) sA = 0;
    else sA = 0.5;
    const expA = 1 / (1 + Math.pow(10, (eB - eA) / 400));
    eloStateForImprovement[m.playerAId] = eA + 32 * (sA - expA);
    eloStateForImprovement[m.playerBId] = eB + 32 * ((1 - sA) - (1 - expA));
    totalEloChange[m.playerAId].end = eloStateForImprovement[m.playerAId];
    totalEloChange[m.playerBId].end = eloStateForImprovement[m.playerBId];
  }
  let mostImproved = { player: '', improvement: 0 };
  Object.entries(totalEloChange).forEach(([pid, change]) => {
    const improvement = change.end - change.start;
    if (improvement > mostImproved.improvement) {
      mostImproved = { player: playerMap[pid], improvement };
    }
  });
  if (mostImproved.improvement > 20) {
    insights.push({
      text: `${mostImproved.player} has the biggest Elo improvement — up ${Math.round(mostImproved.improvement)} pts total! 📈`,
      playerName: mostImproved.player,
      type: 'other',
    });
  }

  // Shuffle and pick 2
  const shuffled = insights.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}
