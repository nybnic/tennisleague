import { useState, useMemo } from 'react';
import { Player, Match, getPlayerColor } from '@/types/tennis';
import { calculateHistory } from '@/utils/standings';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';

interface Props {
  players: Player[];
  matches: Match[];
  playerIndexMap: Record<string, number>;
}

type Metric = 'matchesWonPct' | 'gamesWonPct' | 'elo';

const METRIC_LABELS: Record<Metric, string> = {
  matchesWonPct: 'Match Win %',
  gamesWonPct: 'Game Win %',
  elo: 'Elo Rating',
};

export function HistoryChart({ players, matches, playerIndexMap }: Props) {
  const [metric, setMetric] = useState<Metric>('elo');

  const histories = useMemo(() => {
    return players.map(p => ({
      player: p,
      data: calculateHistory(p.id, matches),
    }));
  }, [players, matches]);

  // Build combined data keyed by match index per player
  const maxMatches = Math.max(...histories.map(h => h.data.length), 0);
  if (maxMatches === 0) return null;

  const chartData = [];
  for (let i = 1; i <= maxMatches; i++) {
    const point: Record<string, number | string> = { match: i };
    histories.forEach(h => {
      const dp = h.data.find(d => d.matchIndex === i);
      if (dp) point[h.player.id] = dp[metric];
    });
    chartData.push(point);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {(Object.keys(METRIC_LABELS) as Metric[]).map(m => (
          <Button
            key={m}
            variant={metric === m ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-7"
            onClick={() => setMetric(m)}
          >
            {METRIC_LABELS[m]}
          </Button>
        ))}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="match" label={{ value: 'Matches Played', position: 'insideBottom', offset: -5, style: { fontSize: 11 } }} />
            <YAxis domain={['auto', 'auto']} tickFormatter={v => metric === 'elo' ? v : `${v}%`} style={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number) => metric === 'elo' ? Math.round(value) : `${value.toFixed(1)}%`} />
            <Legend />
            {players.map(p => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.id}
                name={p.name}
                stroke={getPlayerColor(playerIndexMap[p.id])}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
