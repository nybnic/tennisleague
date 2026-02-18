import { Insight, getPlayerColor } from '@/types/tennis';

interface Props {
  insights: Insight[];
  playerIndexMap: Record<string, number>;
  playerNameToId: Record<string, string>;
}

export function InsightsBar({ insights, playerIndexMap, playerNameToId }: Props) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-1">
      {insights.map((insight, i) => {
        const playerId = playerNameToId[insight.playerName];
        const colorIdx = playerId ? playerIndexMap[playerId] ?? 0 : 0;
        const color = getPlayerColor(colorIdx);
        const parts = insight.text.split(insight.playerName);

        return (
          <div key={i} className="insight-card animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <p className="text-sm md:text-base font-display leading-snug">
              {parts.map((part, j) => (
                <span key={j}>
                  {part}
                  {j < parts.length - 1 && (
                    <span className="font-bold" style={{ color }}>{insight.playerName}</span>
                  )}
                </span>
              ))}
            </p>
          </div>
        );
      })}
    </div>
  );
}
