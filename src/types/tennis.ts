export interface Player {
  id: string;
  name: string;
  createdAt: string;
}

export type Surface = 'hard' | 'clay' | 'grass';

export const SURFACE_META: Record<Surface, { label: string; emoji: string }> = {
  hard: { label: 'Hard', emoji: '🏟️' },
  clay: { label: 'Clay', emoji: '🟤' },
  grass: { label: 'Grass', emoji: '🌿' },
};

export interface Match {
  id: string;
  date: string; // yyyy-mm-dd
  playerAId: string;
  playerBId: string;
  gamesA: number;
  gamesB: number;
  createdAt: string;
  seasonId?: string;
  surface?: Surface;
}

export interface PlayerStanding {
  playerId: string;
  playerName: string;
  matches: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  matchesWonPct: number;
  gamesFor: number;
  gamesAgainst: number;
  gamesWonPct: number;
  elo: number;
}

export interface HeadToHeadRecord {
  wins: number;
  losses: number;
  draws: number;
  gamesFor: number;
  gamesAgainst: number;
}

export interface HistoryPoint {
  matchIndex: number;
  matchesWonPct: number;
  gamesWonPct: number;
  elo: number;
}

export interface Insight {
  text: string;
  playerName: string;
  type: 'streak' | 'gameDiff' | 'elo' | 'other';
}

// Consistent player colors for charts
export const PLAYER_COLORS = [
  'hsl(150, 40%, 35%)',  // green
  'hsl(42, 65%, 55%)',   // gold
  'hsl(200, 70%, 50%)',  // blue
  'hsl(340, 65%, 55%)',  // pink
  'hsl(270, 55%, 55%)',  // purple
  'hsl(20, 70%, 55%)',   // orange
  'hsl(180, 50%, 45%)',  // teal
  'hsl(0, 65%, 55%)',    // red
  'hsl(60, 60%, 45%)',   // olive
  'hsl(310, 50%, 50%)',  // magenta
];

export function getPlayerColor(index: number): string {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}
