import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { League } from '@/types/tennis';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Lock } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setCurrentLeague, authorizeLeague } = useLeagueContext();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorizedLeagueIds, setAuthorizedLeagueIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('tennis-league-authorized-leagues');
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });

  // Create League Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeaguePasscode, setNewLeaguePasscode] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join League Dialog
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [joinPasscode, setJoinPasscode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Fetch leagues on mount
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('leagues')
          .select('*') as any;

        if (fetchError) throw fetchError;

        const formattedLeagues: League[] = (data || []).map((l: any) => ({
          id: l.id,
          name: l.name,
          passcode: l.passcode,
          createdAt: l.created_at,
          createdBy: l.created_by || undefined,
        }));

        setLeagues(formattedLeagues);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch leagues';
        setError(message);
        console.error('Error fetching leagues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLeagueName.trim() || !newLeaguePasscode.trim()) {
      setCreateError('League name and passcode are required');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);

      const { data, error: createErr } = await supabase
        .from('leagues')
        .insert([{
          name: newLeagueName.trim(),
          passcode: newLeaguePasscode.trim(),
          created_by: null,
        }] as any)
        .select()
        .single() as any;

      if (createErr) throw createErr;
      if (!data) throw new Error('Failed to create league');

      const newLeague: League = {
        id: data.id,
        name: data.name,
        passcode: data.passcode,
        createdAt: data.created_at,
        createdBy: data.created_by || undefined,
      };

      setLeagues(prev => [newLeague, ...prev]);
      setCreateDialogOpen(false);
      setNewLeagueName('');
      setNewLeaguePasscode('');

      // Auto-select new league and authenticate
      setCurrentLeague(newLeague);
      authorizeLeague(newLeague.passcode);
      navigate(`/league/${newLeague.id}/matches`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create league');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLeagueId || !joinPasscode.trim()) {
      setJoinError('Please select a league and enter passcode');
      return;
    }

    try {
      setJoinLoading(true);
      setJoinError(null);

      const league = leagues.find(l => l.id === selectedLeagueId);
      if (!league) throw new Error('League not found');

      if (league.passcode !== joinPasscode.trim()) {
        throw new Error('Invalid passcode');
      }

      setCurrentLeague(league);
      authorizeLeague(league.passcode);
      setJoinDialogOpen(false);
      setSelectedLeagueId(null);
      setJoinPasscode('');
      navigate(`/league/${league.id}/matches`);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join league');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeagueClick = (league: League) => {
    // If already authorized, go directly to the league
    if (authorizedLeagueIds.has(league.id)) {
      setCurrentLeague(league);
      navigate(`/league/${league.id}/matches`);
    } else {
      // Otherwise, open join dialog
      setSelectedLeagueId(league.id);
      setJoinDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">🎾</h1>
          <h2 className="text-3xl font-display font-bold mb-2 tracking-tight">
            Tennis League
          </h2>
          <p className="text-muted-foreground text-lg">
            Create or join a league to track matches and standings
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Create/Join Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Dialog open={createDialogOpen} onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (open) {
              setNewLeagueName('');
              setNewLeaguePasscode('');
              setCreateError(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full h-auto py-6 flex flex-col items-center gap-2">
                <Plus className="h-5 w-5" />
                <span>Create New League</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New League</DialogTitle>
                <DialogDescription>
                  Set up a new league with a name and passcode
                </DialogDescription>
              </DialogHeader>
              {createError && (
                <Alert variant="destructive">
                  <AlertDescription>{createError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleCreateLeague} className="space-y-4">
                <div>
                  <Label htmlFor="league-name">League Name</Label>
                  <Input
                    id="league-name"
                    placeholder="e.g., Winter 2026 League"
                    value={newLeagueName}
                    onChange={e => setNewLeagueName(e.target.value)}
                    disabled={createLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="league-passcode">Passcode</Label>
                  <Input
                    id="league-passcode"
                    type="password"
                    placeholder="Create a passcode"
                    value={newLeaguePasscode}
                    onChange={e => setNewLeaguePasscode(e.target.value)}
                    disabled={createLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll need this to modify league data
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLoading}>
                    {createLoading ? 'Creating...' : 'Create League'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={joinDialogOpen} onOpenChange={(open) => {
            setJoinDialogOpen(open);
            if (open) {
              setSelectedLeagueId(null);
              setJoinPasscode('');
              setJoinError(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-auto py-6 flex flex-col items-center gap-2"
              >
                <Lock className="h-5 w-5" />
                <span>Join Existing League</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join League</DialogTitle>
                <DialogDescription>
                  Select a league and enter its passcode to join
                </DialogDescription>
              </DialogHeader>
              {joinError && (
                <Alert variant="destructive">
                  <AlertDescription>{joinError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleJoinLeague} className="space-y-4">
                <div>
                  <Label htmlFor="league-select">Select League</Label>
                  <select
                    id="league-select"
                    value={selectedLeagueId || ''}
                    onChange={e => setSelectedLeagueId(e.target.value || null)}
                    disabled={joinLoading}
                    className="w-full h-9 px-3 py-1 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Choose a league...</option>
                    {leagues.map(league => (
                      <option key={league.id} value={league.id}>
                        {league.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="join-passcode">Passcode</Label>
                  <Input
                    id="join-passcode"
                    type="password"
                    placeholder="Enter league passcode"
                    value={joinPasscode}
                    onChange={e => setJoinPasscode(e.target.value)}
                    disabled={joinLoading}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setJoinDialogOpen(false)}
                    disabled={joinLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={joinLoading || !selectedLeagueId}>
                    {joinLoading ? 'Joining...' : 'Join League'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Available Leagues */}
        {!loading && leagues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Leagues</CardTitle>
              <CardDescription>
                {leagues.length} league{leagues.length !== 1 ? 's' : ''} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {leagues.map(league => (
                  <div
                    key={league.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition"
                    onClick={() => handleLeagueClick(league)}
                  >
                    <p className="font-medium flex items-center gap-2">
                      {league.name}
                      {authorizedLeagueIds.has(league.id) && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-0.5 rounded">
                          Authorized
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(league.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-6 bg-muted/50 border-0">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">🏆 Leagues:</span> Independent groups for tracking matches
              </p>
              <p>
                <span className="font-semibold text-foreground">📊 Seasons:</span> Organize matches within a league
              </p>
              <p>
                <span className="font-semibold text-foreground">🔒 Secure:</span> Passcode-protect your league data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

