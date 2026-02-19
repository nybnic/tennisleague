import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { League } from '@/types/tennis';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { useUser } from '@/contexts/UserContext';
import { isNewAuthSystem } from '@/config/authSystem';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAuth } from '@/integrations/supabase/authClient';
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
import { Plus, Lock, LogOut } from 'lucide-react';

interface LeagueWithRole extends League {
  role?: 'owner' | 'admin' | 'member';
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { setCurrentLeague, authorizeLeague } = useLeagueContext();
  const { user, userProfile, signOut, isLoading: authLoading } = useUser();

  const [leagues, setLeagues] = useState<LeagueWithRole[]>([]);
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
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join League Dialog
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinLeagueId, setJoinLeagueId] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Fetch leagues on mount
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isNewAuthSystem && !user) {
          // If auth system and not logged in, redirect to sign in
          setLeagues([]);
          return;
        }

        let allLeagues: LeagueWithRole[] = [];

        if (isNewAuthSystem && user) {
          // Fetch leagues where user is a member
          const { data: memberData, error: memberError } = await supabaseAuth
            .from('league_members')
            .select('league_id, role')
            .eq('user_id', user.id);

          if (memberError) throw memberError;

          if (memberData && memberData.length > 0) {
            const leagueIds = memberData.map(m => m.league_id);
            
            const { data: leaguesData, error: leaguesError } = await supabaseAuth
              .from('leagues')
              .select('*')
              .in('id', leagueIds);

            if (leaguesError) throw leaguesError;

            allLeagues = (leaguesData || []).map((l: any) => {
              const membership = memberData.find(m => m.league_id === l.id);
              return {
                id: l.id,
                name: l.name,
                passcode: l.passcode,
                createdAt: l.created_at,
                createdBy: l.owner_id,
                role: membership?.role as 'owner' | 'admin' | 'member',
              };
            });
          }
        } else {
          // Fetch all leagues (passcode system)
          const { data, error: fetchError } = await supabase
            .from('leagues')
            .select('*');

          if (fetchError) throw fetchError;

          allLeagues = (data || []).map((l: any) => ({
            id: l.id,
            name: l.name,
            passcode: l.passcode,
            createdAt: l.created_at,
            createdBy: l.created_by || undefined,
          }));
        }

        setLeagues(allLeagues);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch leagues';
        setError(message);
        console.error('Error fetching leagues:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchLeagues();
    }
  }, [user, authLoading]);

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLeagueName.trim()) {
      setCreateError('League name is required');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);

      if (isNewAuthSystem && user) {
        // Auth system: Create league with user as owner
        const { data: leagueData, error: leagueErr } = await supabaseAuth
          .from('leagues')
          .insert([{
            name: newLeagueName.trim(),
            owner_id: user.id,
            requires_double_confirmation: false,
            is_public: false,
          }])
          .select()
          .single();

        if (leagueErr) throw leagueErr;
        if (!leagueData) throw new Error('Failed to create league');

        // Add user as owner member
        const { error: memberErr } = await supabaseAuth
          .from('league_members')
          .insert([{
            league_id: leagueData.id,
            user_id: user.id,
            role: 'owner',
            can_invite: true,
          }]);

        if (memberErr) throw memberErr;

        const newLeague: LeagueWithRole = {
          id: leagueData.id,
          name: leagueData.name,
          passcode: leagueData.passcode,
          createdAt: leagueData.created_at,
          createdBy: user.id,
          role: 'owner',
        };

        setLeagues(prev => [newLeague, ...prev]);
        setCreateDialogOpen(false);
        setNewLeagueName('');

        // Auto-navigate to league
        setCurrentLeague(newLeague);
        navigate(`/league/${newLeague.id}/matches`);
      } else {
        // Passcode system: Create league (old way)
        const passcode = Math.random().toString(36).substring(2, 8);
        
        const { data, error: createErr } = await supabase
          .from('leagues')
          .insert([{
            name: newLeagueName.trim(),
            passcode: passcode,
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

        // Auto-select new league and authenticate
        setCurrentLeague(newLeague);
        authorizeLeague(newLeague.passcode);
        navigate(`/league/${newLeague.id}/matches`);
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create league');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinLeagueId) {
      setJoinError('Please select a league');
      return;
    }

    try {
      setJoinLoading(true);
      setJoinError(null);

      const league = leagues.find(l => l.id === joinLeagueId);
      if (!league) throw new Error('League not found');

      if (isNewAuthSystem) {
        // Auth system: Just navigate to the league (no passcode needed)
        setCurrentLeague(league);
        setJoinDialogOpen(false);
        setJoinLeagueId(null);
        navigate(`/league/${league.id}/matches`);
      } else {
        // Passcode system: Still need to check passcode
        if (league.passcode !== '') {
          setJoinError('Invalid passcode');
          return;
        }
        
        setCurrentLeague(league);
        authorizeLeague(league.passcode);
        setJoinDialogOpen(false);
        setJoinLeagueId(null);
        navigate(`/league/${league.id}/matches`);
      }
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join league');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeagueClick = (league: LeagueWithRole) => {
    // If already authorized (passcode system) or in auth system, go directly to the league
    if (!isNewAuthSystem && authorizedLeagueIds.has(league.id)) {
      setCurrentLeague(league);
      navigate(`/league/${league.id}/matches`);
    } else if (isNewAuthSystem) {
      // Auth system: User is already a member, go directly
      setCurrentLeague(league);
      navigate(`/league/${league.id}/matches`);
    } else {
      // Passcode system: Need to get passcode, open join dialog
      setJoinLeagueId(league.id);
      setJoinDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Auth Header */}
        {isNewAuthSystem && user && (
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <div>
              <p className="text-sm text-muted-foreground">Logged in as</p>
              <p className="font-semibold">{userProfile?.pseudonym || 'User'}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate('/auth/sign-in');
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}

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
        {isNewAuthSystem && !user ? (
          <Alert className="mb-6">
            <AlertDescription>
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => navigate('/auth/sign-in')}
              >
                Sign in
              </Button>
              {' '}to create or join leagues
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Dialog open={createDialogOpen} onOpenChange={(open) => {
              setCreateDialogOpen(open);
              if (open) {
                setNewLeagueName('');
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
                    {isNewAuthSystem 
                      ? 'Set up a new league. You\'ll be the owner.'
                      : 'Set up a new league with a name and passcode'}
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

            {!isNewAuthSystem && (
              <Dialog open={joinDialogOpen} onOpenChange={(open) => {
                setJoinDialogOpen(open);
                if (open) {
                  setJoinLeagueId(null);
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
                  <form onSubmit={handleJoinLeague} className="space-y-4">
                    <div>
                      <Label htmlFor="league-select">Select League</Label>
                      <select
                        id="league-select"
                        value={joinLeagueId || ''}
                        onChange={e => setJoinLeagueId(e.target.value || null)}
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
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setJoinDialogOpen(false)}
                        disabled={joinLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={joinLoading || !joinLeagueId}>
                        {joinLoading ? 'Joining...' : 'Join League'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {/* Available Leagues */}
        {!loading && leagues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Leagues</CardTitle>
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
                    <p className="font-medium flex items-center gap-2 flex-wrap">
                      {league.name}
                      {isNewAuthSystem && league.role && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded capitalize">
                          {league.role}
                        </span>
                      )}
                      {!isNewAuthSystem && authorizedLeagueIds.has(league.id) && (
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

