import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Couple } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  couple: Couple | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  createCouple: () => Promise<Couple>;
  joinCouple: (inviteCode: string) => Promise<Couple>;
  refreshCouple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCouple = async (userId: string) => {
    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching couple:', error);
      return null;
    }

    return data;
  };

  const refreshCouple = async () => {
    if (user) {
      const coupleData = await fetchCouple(user.id);
      setCouple(coupleData);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCouple(session.user.id).then(setCouple);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCouple(session.user.id).then(setCouple);
      } else {
        setCouple(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setCouple(null);
  };

  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const createCouple = async (): Promise<Couple> => {
    if (!user) {
      throw new Error('User must be logged in to create a couple');
    }

    const inviteCode = generateInviteCode();

    const { data, error } = await supabase
      .from('couples')
      .insert({
        user1_id: user.id,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    setCouple(data);
    return data;
  };

  const joinCouple = async (inviteCode: string): Promise<Couple> => {
    if (!user) {
      throw new Error('User must be logged in to join a couple');
    }

    const { data: existingCouple, error: fetchError } = await supabase
      .from('couples')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (fetchError || !existingCouple) {
      throw new Error('Invalid invite code');
    }

    if (existingCouple.user2_id) {
      throw new Error('This couple is already complete');
    }

    if (existingCouple.user1_id === user.id) {
      throw new Error('You cannot join your own couple');
    }

    const { data, error } = await supabase
      .from('couples')
      .update({ user2_id: user.id })
      .eq('id', existingCouple.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    setCouple(data);
    return data;
  };

  const value = {
    user,
    session,
    couple,
    loading,
    signInWithGoogle,
    signOut,
    createCouple,
    joinCouple,
    refreshCouple,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
