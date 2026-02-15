import { useState, useEffect, useCallback } from 'react';
import { Player, Match } from '@/types/tennis';

const PLAYERS_KEY = 'tennis-league-players';
const MATCHES_KEY = 'tennis-league-matches';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function useLeagueData() {
  const [players, setPlayers] = useState<Player[]>(() => loadFromStorage(PLAYERS_KEY, []));
  const [matches, setMatches] = useState<Match[]>(() => loadFromStorage(MATCHES_KEY, []));

  useEffect(() => {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  }, [matches]);

  const addPlayer = useCallback((name: string) => {
    const player: Player = { id: crypto.randomUUID(), name: name.trim(), createdAt: new Date().toISOString() };
    setPlayers(prev => [...prev, player]);
    return player;
  }, []);

  const updatePlayer = useCallback((id: string, name: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name: name.trim() } : p));
  }, []);

  const deletePlayer = useCallback((id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    setMatches(prev => prev.filter(m => m.playerAId !== id && m.playerBId !== id));
  }, []);

  const addMatch = useCallback((match: Omit<Match, 'id' | 'createdAt'>) => {
    const newMatch: Match = { ...match, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setMatches(prev => [...prev, newMatch]);
    return newMatch;
  }, []);

  const updateMatch = useCallback((id: string, data: Partial<Omit<Match, 'id' | 'createdAt'>>) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  }, []);

  const deleteMatch = useCallback((id: string) => {
    setMatches(prev => prev.filter(m => m.id !== id));
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
  };
}
