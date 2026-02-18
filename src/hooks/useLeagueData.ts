import { useState, useEffect, useCallback } from 'react';
import { Player, Match, Season, League } from '@/types/tennis';
import { supabase } from '@/integrations/supabase/client';
import { useLeagueContext } from '@/contexts/LeagueContext';

const CURRENT_SEASON_KEY = 'tennis-league-current-season';

export function useLeagueData() {
  const { currentLeague, isLeagueAuthorized } = useLeagueContext();
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [currentSeasonId, setCurrentSeasonId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load current season on mount
  useEffect(() => {
    const stored = localStorage.getItem(CURRENT_SEASON_KEY);
    if (stored) {
      setCurrentSeasonId(stored);
    }
  }, []);

  // Fetch initial data from Supabase for current league
  useEffect(() => {
    const fetchData = async () => {
      if (!currentLeague) {
        setPlayers([]);
        setSeasons([]);
        setMatches([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch players for this league
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('league_id', currentLeague.id)
          .order('name', { ascending: true });

        if (playersError) throw playersError;

        const formattedPlayers: Player[] = (playersData || []).map(p => ({
          id: p.id,
          name: p.name,
          leagueId: p.league_id,
          createdAt: p.created_at,
        }));

        setPlayers(formattedPlayers);

        // Fetch seasons for this league
        const { data: seasonsData, error: seasonsError } = await supabase
          .from('seasons')
          .select('*')
          .eq('league_id', currentLeague.id)
          .order('created_at', { ascending: false });

        if (seasonsError) throw seasonsError;

        const formattedSeasons: Season[] = (seasonsData || []).map(s => ({
          id: s.id,
          name: s.name,
          leagueId: s.league_id,
          createdAt: s.created_at,
        }));

        setSeasons(formattedSeasons);

        // Set current season to first one if not set
        if (!currentSeasonId && formattedSeasons.length > 0) {
          setCurrentSeasonId(formattedSeasons[0].id);
          localStorage.setItem(CURRENT_SEASON_KEY, formattedSeasons[0].id);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(message);
        console.error('Error fetching data from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLeague]);

  // Fetch matches for current season
  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentSeasonId || !currentLeague) {
        setMatches([]);
        return;
      }

      try {
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .eq('season_id', currentSeasonId)
          .eq('league_id', currentLeague.id)
          .order('date', { ascending: false });

        if (matchesError) throw matchesError;

        const formattedMatches: Match[] = (matchesData || []).map(m => ({
          id: m.id,
          date: m.date,
          playerAId: m.player_a_id,
          playerBId: m.player_b_id,
          gamesA: m.games_a,
          gamesB: m.games_b,
          createdAt: m.created_at,
          seasonId: m.season_id,
          leagueId: m.league_id,
          surface: m.surface as any,
        }));

        setMatches(formattedMatches);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch matches';
        setError(message);
        console.error('Error fetching matches from Supabase:', err);
      }
    };

    fetchMatches();
  }, [currentSeasonId, currentLeague]);

  const switchSeason = useCallback((seasonId: string) => {
    setCurrentSeasonId(seasonId);
    localStorage.setItem(CURRENT_SEASON_KEY, seasonId);
  }, []);

  const createSeason = useCallback(async (name: string) => {
    if (!currentLeague) {
      throw new Error('No league selected');
    }

    if (!isLeagueAuthorized) {
      throw new Error('Not authorized for this league');
    }

    try {
      const { data, error } = await supabase
        .from('seasons')
        .insert([{
          name,
          league_id: currentLeague.id,
        }])
        .select()
        .single();

      if (error) throw error;

      const newSeason: Season = {
        id: data.id,
        name: data.name,
        leagueId: data.league_id,
        createdAt: data.created_at,
      };

      setSeasons(prev => [newSeason, ...prev]);
      setCurrentSeasonId(newSeason.id);
      localStorage.setItem(CURRENT_SEASON_KEY, newSeason.id);
      return newSeason;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create season';
      setError(message);
      console.error('Error creating season:', err);
      throw err;
    }
  }, [currentLeague, isLeagueAuthorized]);

  const addPlayer = useCallback(async (name: string) => {
    if (!currentLeague) {
      throw new Error('No league selected');
    }

    if (!isLeagueAuthorized) {
      throw new Error('Not authorized for this league');
    }

    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{
          name: name.trim(),
          league_id: currentLeague.id,
        }])
        .select()
        .single();

      if (error) throw error;

      const newPlayer: Player = {
        id: data.id,
        name: data.name,
        leagueId: data.league_id,
        createdAt: data.created_at,
      };

      setPlayers(prev => [...prev, newPlayer]);
      return newPlayer;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add player';
      setError(message);
      console.error('Error adding player:', err);
      throw err;
    }
  }, [currentLeague, isLeagueAuthorized]);

  const updatePlayer = useCallback(async (id: string, name: string) => {
    if (!isLeagueAuthorized) {
      throw new Error('Not authorized for this league');
    }

    try {
      const { error } = await supabase
        .from('players')
        .update({ name: name.trim() })
        .eq('id', id);

      if (error) throw error;

      setPlayers(prev => prev.map(p => p.id === id ? { ...p, name: name.trim() } : p));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update player';
      setError(message);
      console.error('Error updating player:', err);
      throw err;
    }
  }, [isLeagueAuthorized]);

  const deletePlayer = useCallback(async (id: string) => {
    if (!isLeagueAuthorized) {
      throw new Error('Not authorized for this league');
    }

    try {
      // Delete matches first (foreign key constraint)
      const { error: matchesError } = await supabase
        .from('matches')
        .delete()
        .or(`player_a_id.eq.${id},player_b_id.eq.${id}`);

      if (matchesError) throw matchesError;

      // Then delete player
      const { error: playerError } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (playerError) throw playerError;

      setPlayers(prev => prev.filter(p => p.id !== id));
      setMatches(prev => prev.filter(m => m.playerAId !== id && m.playerBId !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete player';
      setError(message);
      console.error('Error deleting player:', err);
      throw err;
    }
  }, [isLeagueAuthorized]);

  const addMatch = useCallback(async (match: Omit<Match, 'id' | 'createdAt' | 'leagueId'>) => {
    if (!currentSeasonId || !currentLeague) {
      throw new Error('No season or league selected');
    }

    if (!isLeagueAuthorized) {
      throw new Error('Not authorized for this league');
    }

    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([{
          date: match.date,
          player_a_id: match.playerAId,
          player_b_id: match.playerBId,
          games_a: match.gamesA,
          games_b: match.gamesB,
          season_id: currentSeasonId,
          league_id: currentLeague.id,
          surface: match.surface || null,
        }])
        .select()
        .single();

      if (error) throw error;

      const newMatch: Match = {
        id: data.id,
        date: data.date,
        playerAId: data.player_a_id,
        playerBId: data.player_b_id,
        gamesA: data.games_a,
        gamesB: data.games_b,
        createdAt: data.created_at,
        seasonId: data.season_id,
        leagueId: data.league_id,
        surface: data.surface,
      };

      setMatches(prev => [...prev, newMatch]);
      return newMatch;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add match';
      setError(message);
      console.error('Error adding match:', err);
      throw err;
    }
  }, [currentSeasonId, currentLeague, isLeagueAuthorized]);

  const updateMatch = useCallback(async (id: string, data: Partial<Omit<Match, 'id' | 'createdAt'>>) => {
    if (!isLeagueAuthorized) {
      throw new Error('Not authorized for this league');
    }

    try {
      const updateData: Record<string, any> = {};
      if (data.date) updateData.date = data.date;
      if (data.playerAId) updateData.player_a_id = data.playerAId;
      if (data.playerBId) updateData.player_b_id = data.playerBId;
      if (data.gamesA !== undefined) updateData.games_a = data.gamesA;
      if (data.gamesB !== undefined) updateData.games_b = data.gamesB;
      if (data.surface) updateData.surface = data.surface;

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setMatches(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update match';
      setError(message);
      console.error('Error updating match:', err);
      throw err;
    }
  }, [isLeagueAuthorized]);

  const deleteMatch = useCallback(async (id: string) => {
    if (!isLeagueAuthorized) {
      throw new Error('Not authorized for this league');
    }

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMatches(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete match';
      setError(message);
      console.error('Error deleting match:', err);
      throw err;
    }
  }, [isLeagueAuthorized]);

  const sortedMatches = [...matches].sort((a, b) => {
    const dateComp = b.date.localeCompare(a.date);
    if (dateComp !== 0) return dateComp;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return {
    players,
    seasons,
    currentSeasonId,
    matches: sortedMatches,
    rawMatches: matches,
    loading,
    error,
    switchSeason,
    createSeason,
    addPlayer,
    updatePlayer,
    deletePlayer,
    addMatch,
    updateMatch,
    deleteMatch,
  };
}

