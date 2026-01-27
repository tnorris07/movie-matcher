import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Match, Movie } from '../types';
import { useAuth } from './useAuth';

interface LikeData {
  movie_id: number;
  created_at: string;
  swipe_type: string;
  movie: Movie;
}

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

export const useMyLikes = () => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<LikeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyLikes();
    }
  }, [user]);

  const fetchMyLikes = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get all movies the user swiped right on (yes or seen_yes)
      const { data, error } = await supabase
        .from('swipes')
        .select('movie_id, created_at, swipe_type, movie:movies(*)')
        .eq('user_id', user.id)
        .in('swipe_type', ['yes', 'seen_yes'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our expected type
      const transformedData = (data || []).map((item) => ({
        movie_id: item.movie_id,
        created_at: item.created_at,
        swipe_type: item.swipe_type,
        movie: item.movie as unknown as Movie,
      }));

      setLikes(transformedData);
    } catch (err) {
      console.error('Error fetching my likes:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    likes,
    loading,
    refetch: fetchMyLikes,
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
