import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseAuth } from '@/integrations/supabase/authClient';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  pseudonym: string;
  createdAt: string;
}

interface UserContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUpWithEmail: (email: string, pseudonym: string) => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[UserContext] Checking existing session...");
        
        // If we're on the callback page with hash params, Supabase needs time to process them
        if (window.location.hash) {
          console.log("[UserContext] Detected hash params, waiting for Supabase to process...");
          // Give Supabase a moment to process the magic link
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const sessionPromise = supabaseAuth.auth.getSession();
        
        // Set a 5 second timeout for session check
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session check timeout")), 5000)
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (session?.user) {
          console.log("[UserContext] Found existing session for user:", session.user.id);
          setUser(session.user);
          // Fetch user profile
          const { data, error } = await supabaseAuth
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.log("[UserContext] No user profile yet, will create on auth state change");
          } else if (data) {
            setUserProfile({
              id: data.id,
              email: data.email,
              pseudonym: data.pseudonym,
              createdAt: data.created_at,
            });
          }
        } else {
          console.log("[UserContext] No existing session found");
        }
      } catch (error) {
        console.error('[UserContext] Error checking auth:', error);
        // Don't block the UI on auth check errors
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(async (event, session) => {
      console.log("[UserContext] Auth state changed:", event, "User:", session?.user?.id);
      if (session?.user) {
        setUser(session.user);
        
        // Try to fetch existing profile
        const { data: existingProfile } = await supabaseAuth
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (existingProfile) {
          // Profile exists, use it
          console.log("[UserContext] Found existing profile");
          setUserProfile({
            id: existingProfile.id,
            email: existingProfile.email,
            pseudonym: existingProfile.pseudonym,
            createdAt: existingProfile.created_at,
          });
        } else if (event === 'SIGNED_IN') {
          // First sign in - create profile from pending pseudonym or user metadata
          const pseudonym = sessionStorage.getItem('pendingPseudonym') || session.user.user_metadata?.pseudonym || session.user.email?.split('@')[0] || 'User';
          
          console.log("[UserContext] Creating profile for new user with pseudonym:", pseudonym);
          const { data: newProfile, error: profileError } = await supabaseAuth
            .from('users')
            .insert([{
              id: session.user.id,
              email: session.user.email,
              pseudonym,
            }])
            .select()
            .single();
          
          if (profileError) {
            console.error("[UserContext] Error creating profile:", profileError);
          } else if (newProfile) {
            setUserProfile({
              id: newProfile.id,
              email: newProfile.email,
              pseudonym: newProfile.pseudonym,
              createdAt: newProfile.created_at,
            });
          }
          
          sessionStorage.removeItem('pendingPseudonym');
        }
      } else {
        console.log("[UserContext] User signed out");
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUpWithEmail = async (email: string, pseudonym: string) => {
    try {
      setIsLoading(true);
      console.log("[UserContext] Starting signUpWithEmail for:", email);
      
      // Sign up with email (sends magic link)
      // Store pseudonym in sessionStorage for use after email verification
      sessionStorage.setItem('pendingPseudonym', pseudonym);
      console.log("[UserContext] Stored pending pseudonym, calling Supabase...");
      
      const { error: authError } = await supabaseAuth.auth.signUp({
        email,
        password: Math.random().toString(36).slice(2), // Dummy password (not used for magic links)
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { pseudonym },
        },
      });

      if (authError) {
        console.error("[UserContext] Auth error:", authError);
        throw authError;
      }
      
      console.log("[UserContext] signUpWithEmail completed successfully");
    } catch (error) {
      console.error('[UserContext] Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabaseAuth.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      setIsLoading(true);
      console.log("[UserContext] verifyOtp called - Supabase handles this automatically via onAuthStateChange");
      
      // Supabase automatically handles magic link verification
      // The token in the URL hash is processed by the auth client
      // No manual verification needed
      const { error } = await supabaseAuth.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) throw error;
      
      console.log("[UserContext] OTP verified successfully");
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabaseAuth.auth.signOut();
      if (error) throw error;
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isAuthenticated: !!user,
        signUpWithEmail,
        signInWithEmail,
        verifyOtp,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
