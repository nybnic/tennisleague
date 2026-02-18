import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { League } from '@/types/tennis';
import { supabase } from '@/integrations/supabase/client';

interface LeagueContextType {
  // League selection
  currentLeague: League | null;
  setCurrentLeague: (league: League) => void;
  
  // League management
  renameLeague: (newName: string) => Promise<void>;
  
  // Authorization
  isLeagueAuthorized: boolean;
  authorizeLeague: (passcode: string) => void;
  
  // Future Supabase Auth integration
  currentUserId: string | null;
  setCurrentUserId: (userId: string | null) => void;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

const CURRENT_LEAGUE_KEY = 'tennis-league-current-league';
const AUTHORIZED_LEAGUES_KEY = 'tennis-league-authorized-leagues';

export function LeagueProvider({ children }: { children: React.ReactNode }) {
  const [currentLeague, setCurrentLeagueState] = useState<League | null>(null);
  const [isLeagueAuthorized, setIsLeagueAuthorized] = useState(false);
  const [authorizedLeagues, setAuthorizedLeagues] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(AUTHORIZED_LEAGUES_KEY);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load saved league on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CURRENT_LEAGUE_KEY);
      if (stored) {
        const league = JSON.parse(stored) as League;
        setCurrentLeagueState(league);
        
        // Check if this league is authorized
        setIsLeagueAuthorized(authorizedLeagues.has(league.id));
      }
    } catch (err) {
      console.error('Failed to load saved league:', err);
    }
  }, [authorizedLeagues]);

  const setCurrentLeague = useCallback((league: League) => {
    setCurrentLeagueState(league);
    localStorage.setItem(CURRENT_LEAGUE_KEY, JSON.stringify(league));
    
    // Check if already authorized
    setIsLeagueAuthorized(authorizedLeagues.has(league.id));
  }, [authorizedLeagues]);

  const authorizeLeague = useCallback((passcode: string) => {
    if (!currentLeague) {
      throw new Error('No league selected');
    }

    if (currentLeague.passcode !== passcode) {
      throw new Error('Invalid passcode');
    }

    // If currentUserId is set (Supabase Auth enabled), skip passcode
    // For now, just do passcode verification
    if (!currentUserId && currentLeague.passcode !== passcode) {
      throw new Error('Invalid passcode');
    }

    const newAuthorizedLeagues = new Set(authorizedLeagues);
    newAuthorizedLeagues.add(currentLeague.id);
    setAuthorizedLeagues(newAuthorizedLeagues);
    setIsLeagueAuthorized(true);
    
    localStorage.setItem(
      AUTHORIZED_LEAGUES_KEY,
      JSON.stringify(Array.from(newAuthorizedLeagues))
    );
  }, [currentLeague, currentUserId, authorizedLeagues]);

  const renameLeague = useCallback(async (newName: string) => {
    if (!currentLeague) {
      throw new Error('No league selected');
    }

    if (!isLeagueAuthorized) {
      throw new Error('Not authorized for this league');
    }

    try {
      const { data, error } = await (supabase as any)
        .from('leagues')
        .update({ name: newName.trim() })
        .eq('id', currentLeague.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned');

      const updatedLeague: League = {
        id: data.id,
        name: data.name,
        passcode: data.passcode,
        createdAt: data.created_at,
      };

      setCurrentLeagueState(updatedLeague);
      localStorage.setItem(CURRENT_LEAGUE_KEY, JSON.stringify(updatedLeague));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rename league';
      console.error('Error renaming league:', err);
      throw new Error(message);
    }
  }, [currentLeague, isLeagueAuthorized]);

  return (
    <LeagueContext.Provider value={{
      currentLeague,
      setCurrentLeague,
      renameLeague,
      isLeagueAuthorized,
      authorizeLeague,
      currentUserId,
      setCurrentUserId,
    }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeagueContext() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeagueContext must be used within LeagueProvider');
  }
  return context;
}
