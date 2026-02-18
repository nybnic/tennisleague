import { useMemo, useState } from 'react';
import { Surface, SURFACE_META } from '@/types/tennis';
import { useLeagueData } from '@/hooks/useLeagueData';
import { calculateStandings, calculateHeadToHead } from '@/utils/standings';
import { calculateTrends } from '@/utils/trends';
import { generateInsights } from '@/utils/insights';
import { calculatePlayerTooltips } from '@/utils/playerTooltip';
import { BottomNav } from '@/components/BottomNav';
import { SeasonSelector } from '@/components/SeasonSelector';
import { StandingsTable } from '@/components/StandingsTable';
import { HeadToHeadMatrix } from '@/components/HeadToHeadMatrix';
import { HistoryChart } from '@/components/HistoryChart';
import { InsightsBar } from '@/components/InsightsBar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export default function StandingsPage() {
  const {
    players,
    matches,
    rawMatches,
    seasons,
    currentSeasonId,
    loading,
    switchSeason,
    createSeason,
  } = useLeagueData();

  const [surfaceFilter, setSurfaceFilter] = useState<Surface | 'all'>('all');

  // Filter matches by surface
  const filteredMatches = useMemo(() => {
    if (surfaceFilter === 'all') return rawMatches;
    return rawMatches.filter(m => m.surface === surfaceFilter);
  }, [rawMatches, surfaceFilter]);

  const standings = useMemo(() => calculateStandings(players, filteredMatches), [players, filteredMatches]);
  const h2h = useMemo(() => calculateHeadToHead(players, filteredMatches), [players, filteredMatches]);
  const insights = useMemo(() => generateInsights(players, filteredMatches), [players, filteredMatches]);
  const trends = useMemo(() => calculateTrends(players, filteredMatches), [players, filteredMatches]);
  const tooltips = useMemo(() => calculatePlayerTooltips(players, filteredMatches), [players, filteredMatches]);
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
        <div className="container space-y-3 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-bold tracking-tight">🏆 Standings</h1>
            <SeasonSelector
              seasons={seasons}
              currentSeasonId={currentSeasonId}
              onSeasonChange={switchSeason}
              onCreateSeason={createSeason}
            />
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground font-medium">Court:</span>
            <Button
              variant={surfaceFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSurfaceFilter('all')}
              className="h-7 text-xs"
            >
              All
            </Button>
            {(Object.keys(SURFACE_META) as Surface[]).map(surface => (
              <Button
                key={surface}
                variant={surfaceFilter === surface ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSurfaceFilter(surface)}
                className="h-7 text-xs"
              >
                {SURFACE_META[surface].emoji} {SURFACE_META[surface].label}
              </Button>
            ))}
          </div>
        </div>
      </header>
      <main className="container py-4 space-y-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading standings...</div>
        ) : !currentSeasonId ? (
          <div className="text-center py-8 text-muted-foreground">Select a season to view standings</div>
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
                    <HistoryChart players={players} matches={filteredMatches} playerIndexMap={playerIndexMap} />
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
