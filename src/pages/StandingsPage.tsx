import { useMemo, useState } from 'react';
import { useLeagueData } from '@/hooks/useLeagueData';
import { calculateStandings, calculateHeadToHead } from '@/utils/standings';
import { calculateTrends } from '@/utils/trends';
import { generateInsights } from '@/utils/insights';
import { calculatePlayerTooltips } from '@/utils/playerTooltip';
import { BottomNav } from '@/components/BottomNav';
import { StandingsTable } from '@/components/StandingsTable';
import { HeadToHeadMatrix } from '@/components/HeadToHeadMatrix';
import { HistoryChart } from '@/components/HistoryChart';
import { InsightsBar } from '@/components/InsightsBar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

export default function StandingsPage() {
  const { players, matches, rawMatches, loading } = useLeagueData();

  const standings = useMemo(() => calculateStandings(players, rawMatches), [players, rawMatches]);
  const h2h = useMemo(() => calculateHeadToHead(players, rawMatches), [players, rawMatches]);
  const insights = useMemo(() => generateInsights(players, rawMatches), [players, rawMatches]);
  const trends = useMemo(() => calculateTrends(players, rawMatches), [players, rawMatches]);
  const tooltips = useMemo(() => calculatePlayerTooltips(players, rawMatches), [players, rawMatches]);
  const playerIndexMap = useMemo(() => {
    const sorted = [...players].sort((a, b) => a.name.localeCompare(b.name));
    return Object.fromEntries(sorted.map((p, i) => [p.id, i]));
  }, [players]);

  const playerNameToId = useMemo(() => {
    return Object.fromEntries(players.map(p => [p.name, p.id]));
  }, [players]);

  const [leagueOpen, setLeagueOpen] = useState(true);
  const [h2hOpen, setH2hOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container py-3">
          <h1 className="text-xl font-display font-bold tracking-tight">🏆 Standings</h1>
        </div>
      </header>
      <main className="container py-4 space-y-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading standings...</div>
        ) : (
          <>
            <InsightsBar insights={insights} playerIndexMap={playerIndexMap} playerNameToId={playerNameToId} />

            <Collapsible open={leagueOpen} onOpenChange={setLeagueOpen}>
              <section>
                <CollapsibleTrigger className="flex items-center gap-1 w-full text-left group cursor-pointer">
                  <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">League Table</h2>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${leagueOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <StandingsTable standings={standings} trends={trends} tooltips={tooltips} />
                </CollapsibleContent>
              </section>
            </Collapsible>

            <Collapsible open={h2hOpen} onOpenChange={setH2hOpen}>
              <section>
                <CollapsibleTrigger className="flex items-center gap-1 w-full text-left group cursor-pointer">
                  <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">Head to Head</h2>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${h2hOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="rounded-lg border border-border bg-card p-3">
                    <HeadToHeadMatrix players={players} h2h={h2h} playerIndexMap={playerIndexMap} />
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
              <section>
                <CollapsibleTrigger className="flex items-center gap-1 w-full text-left group cursor-pointer">
                  <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">Historical Development</h2>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${historyOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <HistoryChart players={players} matches={rawMatches} playerIndexMap={playerIndexMap} />
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
