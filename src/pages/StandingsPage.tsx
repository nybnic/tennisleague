import { useMemo } from 'react';
import { useLeagueData } from '@/hooks/useLeagueData';
import { calculateStandings, calculateHeadToHead } from '@/utils/standings';
import { generateInsights } from '@/utils/insights';
import { BottomNav } from '@/components/BottomNav';
import { StandingsTable } from '@/components/StandingsTable';
import { HeadToHeadMatrix } from '@/components/HeadToHeadMatrix';
import { HistoryChart } from '@/components/HistoryChart';
import { InsightsBar } from '@/components/InsightsBar';

export default function StandingsPage() {
  const { players, matches, rawMatches } = useLeagueData();

  const standings = useMemo(() => calculateStandings(players, rawMatches), [players, rawMatches]);
  const h2h = useMemo(() => calculateHeadToHead(players, rawMatches), [players, rawMatches]);
  const insights = useMemo(() => generateInsights(players, rawMatches), [players, rawMatches]);

  // Consistent player color index mapping (sorted by name for stability)
  const playerIndexMap = useMemo(() => {
    const sorted = [...players].sort((a, b) => a.name.localeCompare(b.name));
    return Object.fromEntries(sorted.map((p, i) => [p.id, i]));
  }, [players]);

  const playerNameToId = useMemo(() => {
    return Object.fromEntries(players.map(p => [p.name, p.id]));
  }, [players]);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container py-3">
          <h1 className="text-xl font-display font-bold tracking-tight">🏆 Standings</h1>
        </div>
      </header>
      <main className="container py-4 space-y-6">
        {/* Insights */}
        <InsightsBar insights={insights} playerIndexMap={playerIndexMap} playerNameToId={playerNameToId} />

        {/* Standings Table */}
        <section>
          <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2">League Table</h2>
          <StandingsTable standings={standings} />
        </section>

        {/* Head to Head */}
        <section>
          <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2">Head to Head</h2>
          <div className="rounded-lg border border-border bg-card p-3">
            <HeadToHeadMatrix players={players} h2h={h2h} playerIndexMap={playerIndexMap} />
          </div>
        </section>

        {/* History Chart */}
        <section>
          <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2">Historical Development</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <HistoryChart players={players} matches={rawMatches} playerIndexMap={playerIndexMap} />
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
