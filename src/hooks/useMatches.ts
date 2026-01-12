import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Match } from '../types';
import { useAuth } from './useAuth';

export const useMatches = () => {
  const { couple } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (couple) {
      fetchMatches();
    }
  }, [couple]);

  const fetchMatches = async () => {
    if (!couple) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('matches')
        .select('*, movie:movies(*)')
        .eq('couple_id', couple.id)
        .eq('watched', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMatches(data || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsWatched = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          watched: true,
          watched_at: new Date().toISOString(),
        })
        .eq('id', matchId);

      if (error) throw error;

      await fetchMatches();
    } catch (err) {
      console.error('Error marking as watched:', err);
      throw err;
    }
  };

  return {
    matches,
    loading,
    refetch: fetchMatches,
    markAsWatched,
  };
};

export const useWatchedMovies = () => {
  const { couple } = useAuth();
  const [watchedMovies, setWatchedMovies] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (couple) {
      fetchWatchedMovies();
    }
  }, [couple]);

  const fetchWatchedMovies = async () => {
    if (!couple) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('matches')
        .select('*, movie:movies(*)')
        .eq('couple_id', couple.id)
        .eq('watched', true)
        .order('watched_at', { ascending: false });

      if (error) throw error;

      setWatchedMovies(data || []);
    } catch (err) {
      console.error('Error fetching watched movies:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    watchedMovies,
    loading,
    refetch: fetchWatchedMovies,
  };
};
