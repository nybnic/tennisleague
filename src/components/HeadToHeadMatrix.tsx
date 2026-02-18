import { Player, HeadToHeadRecord, getPlayerColor } from '@/types/tennis';

interface Props {
  players: Player[];
  h2h: Record<string, Record<string, HeadToHeadRecord>>;
  playerIndexMap: Record<string, number>;
}

export function HeadToHeadMatrix({ players, h2h, playerIndexMap }: Props) {
  if (players.length < 2) return null;

  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <table className="text-xs md:text-sm w-full">
        <thead>
          <tr>
            <th className="p-2 md:p-3 text-left font-display min-w-[70px] md:min-w-[100px]">H2H</th>
            {players.map(p => (
              <th key={p.id} className="p-2 md:p-3 text-center font-display min-w-[60px] md:min-w-[100px]" style={{ color: getPlayerColor(playerIndexMap[p.id]) }} title={p.name}>
                <span className="hidden sm:inline">{p.name}</span>
                <span className="sm:hidden text-[11px] font-medium">{p.name.substring(0, 3)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map(p => (
            <tr key={p.id}>
              <td className="p-2 md:p-3 font-medium min-w-[70px] md:min-w-[100px] text-xs md:text-sm" style={{ color: getPlayerColor(playerIndexMap[p.id]) }} title={p.name}>
                <span className="hidden sm:inline">{p.name}</span>
                <span className="sm:hidden text-[11px]">{p.name.substring(0, 3)}</span>
              </td>
              {players.map(q => {
                if (p.id === q.id) {
                  return <td key={q.id} className="p-2 md:p-3 text-center bg-muted/30 text-xs md:text-sm">—</td>;
                }
                const record = h2h[p.id]?.[q.id];
                if (!record) return <td key={q.id} className="p-2 md:p-3 text-center text-xs md:text-sm">-</td>;
                const total = record.wins + record.losses + record.draws;
                if (total === 0) return <td key={q.id} className="p-2 md:p-3 text-center text-muted-foreground text-xs md:text-sm">0-0</td>;
                return (
                  <td key={q.id} className="p-2 md:p-3 text-center tabular-nums text-xs md:text-sm">
                    <span className={record.wins > record.losses ? 'font-bold text-primary' : record.wins < record.losses ? 'text-muted-foreground' : ''}>
                      {record.wins}-{record.losses}
                      {record.draws > 0 && <span className="text-muted-foreground">-{record.draws}</span>}
                    </span>
                    <span className="text-muted-foreground text-[10px] ml-0.5">({record.gamesFor}:{record.gamesAgainst})</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
