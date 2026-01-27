import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Movie } from '../types';
import { useAuth } from './useAuth';

export const useMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('tmdb_rating', { ascending: false });

      if (error) throw error;

      setMovies(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  return { movies, loading, error, refetch: fetchMovies };
};

export const useUnswipedMovies = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset state when user changes (including logout/login)
    setMovies([]);
    setCurrentIndex(0);

    if (user?.id) {
      fetchUnswipedMovies();
    }
  }, [user?.id]); // Depend on user.id specifically, not the whole user object

  const fetchUnswipedMovies = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: swipedMovieIds } = await supabase
        .from('swipes')
        .select('movie_id')
        .eq('user_id', user.id);

      const swipedIds = swipedMovieIds?.map((s) => s.movie_id) || [];

      let query = supabase
        .from('movies')
        .select('*')
        .order('tmdb_rating', { ascending: false })
        .limit(50);

      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMovies(data || []);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error fetching unswiped movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextMovie = () => {
    if (currentIndex < movies.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      fetchUnswipedMovies();
    }
  };

  const currentMovie = movies[currentIndex] || null;

  return {
    currentMovie,
    loading,
    nextMovie,
    refetch: fetchUnswipedMovies,
    hasMore: currentIndex < movies.length - 1 || movies.length === 50,
  };
};
