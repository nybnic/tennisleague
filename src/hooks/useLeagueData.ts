import { useState, useEffect, useCallback } from 'react';
import { Player, Match } from '@/types/tennis';
import { supabase } from '@/integrations/supabase/client';

export function useLeagueData() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*');

        if (playersError) throw playersError;

        const formattedPlayers: Player[] = (playersData || []).map(p => ({
          id: p.id,
          name: p.name,
          createdAt: p.created_at,
        }));

        setPlayers(formattedPlayers);

        // Fetch matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*');

        if (matchesError) throw matchesError;

        const formattedMatches: Match[] = (matchesData || []).map(m => ({
          id: m.id,
          date: m.date,
          playerAId: m.player_a_id,
          playerBId: m.player_b_id,
          gamesA: m.games_a,
          gamesB: m.games_b,
          createdAt: m.created_at,
        }));

        setMatches(formattedMatches);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(message);
        console.error('Error fetching data from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addPlayer = useCallback(async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      const newPlayer: Player = {
        id: data.id,
        name: data.name,
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
  }, []);

  const updatePlayer = useCallback(async (id: string, name: string) => {
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
  }, []);

  const deletePlayer = useCallback(async (id: string) => {
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
  }, []);

  const addMatch = useCallback(async (match: Omit<Match, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([{
          date: match.date,
          player_a_id: match.playerAId,
          player_b_id: match.playerBId,
          games_a: match.gamesA,
          games_b: match.gamesB,
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
      };

      setMatches(prev => [...prev, newMatch]);
      return newMatch;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add match';
      setError(message);
      console.error('Error adding match:', err);
      throw err;
    }
  }, []);

  const updateMatch = useCallback(async (id: string, data: Partial<Omit<Match, 'id' | 'createdAt'>>) => {
    try {
      const updateData: Record<string, any> = {};
      if (data.date) updateData.date = data.date;
      if (data.playerAId) updateData.player_a_id = data.playerAId;
      if (data.playerBId) updateData.player_b_id = data.playerBId;
      if (data.gamesA !== undefined) updateData.games_a = data.gamesA;
      if (data.gamesB !== undefined) updateData.games_b = data.gamesB;

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
  }, []);

  const deleteMatch = useCallback(async (id: string) => {
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
  }, []);

  const sortedMatches = [...matches].sort((a, b) => {
    const dateComp = b.date.localeCompare(a.date);
    if (dateComp !== 0) return dateComp;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return {
    players,
    matches: sortedMatches,
    rawMatches: matches,
    addPlayer,
    updatePlayer,
    deletePlayer,
    addMatch,
    updateMatch,
    deleteMatch,
    loading,
    error,
  };
}
