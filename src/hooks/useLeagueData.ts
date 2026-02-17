import { useState, useEffect, useCallback } from 'react';
import { Player, Match } from '@/types/tennis';
import { supabase } from '@/integrations/supabase/client';

// Fallback to localStorage if Supabase is not available
const PLAYERS_KEY = 'tennis-league-players';
const MATCHES_KEY = 'tennis-league-matches';
const USE_LOCAL_STORAGE = !import.meta.env.VITE_SUPABASE_URL;

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function useLeagueData() {
  const [players, setPlayers] = useState<Player[]>(() => 
    USE_LOCAL_STORAGE ? loadFromStorage(PLAYERS_KEY, []) : []
  );
  const [matches, setMatches] = useState<Match[]>(() => 
    USE_LOCAL_STORAGE ? loadFromStorage(MATCHES_KEY, []) : []
  );
  const [loading, setLoading] = useState(true);
  const [isSupabaseAvailable] = useState(!USE_LOCAL_STORAGE);

  // Load data from Supabase on mount
  useEffect(() => {
    if (USE_LOCAL_STORAGE) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [playersRes, matchesRes] = await Promise.all([
          supabase.from('players').select('*').order('created_at', { ascending: false }),
          supabase.from('matches').select('*').order('created_at', { ascending: false }),
        ]);

        if (playersRes.error) throw playersRes.error;
        if (matchesRes.error) throw matchesRes.error;

        // Transform database records to app types
        const transformedPlayers = (playersRes.data || []).map(p => ({
          id: p.id,
          name: p.name,
          createdAt: p.created_at,
        }));

        const transformedMatches = (matchesRes.data || []).map(m => ({
          id: m.id,
          date: m.date,
          playerAId: m.player_a_id,
          playerBId: m.player_b_id,
          gamesA: m.games_a,
          gamesB: m.games_b,
          surface: m.surface as any,
          seasonId: m.league_id,
          createdAt: m.created_at,
        }));

        setPlayers(transformedPlayers);
        setMatches(transformedMatches);
      } catch (error) {
        console.error('Failed to load data from Supabase:', error);
        // Fallback to empty arrays if Supabase fails
        setPlayers([]);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sync to localStorage if using it
  useEffect(() => {
    if (USE_LOCAL_STORAGE) {
      localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
    }
  }, [players]);

  useEffect(() => {
    if (USE_LOCAL_STORAGE) {
      localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    }
  }, [matches]);

  const addPlayer = useCallback(async (name: string): Promise<Player> => {
    const trimmedName = name.trim();

    if (USE_LOCAL_STORAGE) {
      const player: Player = { 
        id: crypto.randomUUID(), 
        name: trimmedName, 
        createdAt: new Date().toISOString() 
      };
      setPlayers(prev => [...prev, player]);
      return player;
    }

    try {
      const { data, error } = await supabase
        .from('players')
        .insert({ name: trimmedName })
        .select()
        .single();

      if (error) throw error;

      const player: Player = {
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
      };

      setPlayers(prev => [player, ...prev]);
      return player;
    } catch (error) {
      console.error('Failed to add player:', error);
      throw error;
    }
  }, []);

  const updatePlayer = useCallback(async (id: string, name: string) => {
    const trimmedName = name.trim();

    if (USE_LOCAL_STORAGE) {
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, name: trimmedName } : p));
      return;
    }

    try {
      const { error } = await supabase
        .from('players')
        .update({ name: trimmedName })
        .eq('id', id);

      if (error) throw error;

      setPlayers(prev => prev.map(p => p.id === id ? { ...p, name: trimmedName } : p));
    } catch (error) {
      console.error('Failed to update player:', error);
      throw error;
    }
  }, []);

  const deletePlayer = useCallback(async (id: string) => {
    if (USE_LOCAL_STORAGE) {
      setPlayers(prev => prev.filter(p => p.id !== id));
      setMatches(prev => prev.filter(m => m.playerAId !== id && m.playerBId !== id));
      return;
    }

    try {
      const { error } = await supabase.from('players').delete().eq('id', id);

      if (error) throw error;

      setPlayers(prev => prev.filter(p => p.id !== id));
      setMatches(prev => prev.filter(m => m.playerAId !== id && m.playerBId !== id));
    } catch (error) {
      console.error('Failed to delete player:', error);
      throw error;
    }
  }, []);

  const addMatch = useCallback(
    async (match: Omit<Match, 'id' | 'createdAt'>): Promise<Match> => {
      if (USE_LOCAL_STORAGE) {
        const newMatch: Match = { 
          ...match, 
          id: crypto.randomUUID(), 
          createdAt: new Date().toISOString() 
        };
        setMatches(prev => [...prev, newMatch]);
        return newMatch;
      }

      try {
        const { data, error } = await supabase
          .from('matches')
          .insert({
            date: match.date,
            player_a_id: match.playerAId,
            player_b_id: match.playerBId,
            games_a: match.gamesA,
            games_b: match.gamesB,
            surface: match.surface || null,
            league_id: match.seasonId || null,
          })
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
          surface: data.surface as any,
          seasonId: data.league_id,
          createdAt: data.created_at,
        };

        setMatches(prev => [newMatch, ...prev]);
        return newMatch;
      } catch (error) {
        console.error('Failed to add match:', error);
        throw error;
      }
    },
    []
  );

  const updateMatch = useCallback(
    async (id: string, data: Partial<Omit<Match, 'id' | 'createdAt'>>) => {
      if (USE_LOCAL_STORAGE) {
        setMatches(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
        return;
      }

      try {
        const updateData: Record<string, any> = {};
        if (data.date) updateData.date = data.date;
        if (data.playerAId) updateData.player_a_id = data.playerAId;
        if (data.playerBId) updateData.player_b_id = data.playerBId;
        if (data.gamesA !== undefined) updateData.games_a = data.gamesA;
        if (data.gamesB !== undefined) updateData.games_b = data.gamesB;
        if (data.surface !== undefined) updateData.surface = data.surface;
        if (data.seasonId) updateData.league_id = data.seasonId;

        const { error } = await supabase.from('matches').update(updateData).eq('id', id);

        if (error) throw error;

        setMatches(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
      } catch (error) {
        console.error('Failed to update match:', error);
        throw error;
      }
    },
    []
  );

  const deleteMatch = useCallback(async (id: string) => {
    if (USE_LOCAL_STORAGE) {
      setMatches(prev => prev.filter(m => m.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from('matches').delete().eq('id', id);

      if (error) throw error;

      setMatches(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete match:', error);
      throw error;
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
    isSupabaseAvailable,
  };
}
