import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SwipeType } from '../types';
import { useAuth } from './useAuth';

export const useSwipes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lastSwipe, setLastSwipe] = useState<{ movieId: number; swipeType: SwipeType } | null>(null);

  const createSwipe = async (movieId: number, swipeType: SwipeType) => {
    if (!user) {
      throw new Error('User must be logged in to swipe');
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('swipes')
        .upsert(
          {
            user_id: user.id,
            movie_id: movieId,
            swipe_type: swipeType,
          },
          { onConflict: 'user_id,movie_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Failed to save swipe: ${error.message} (Code: ${error.code})`);
      }

      setLastSwipe({ movieId, swipeType });

      const { data: matchData } = await supabase
        .from('matches')
        .select('*, movie:movies(*)')
        .eq('movie_id', movieId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return { swipe: data, match: matchData };
    } catch (err) {
      console.error('Error creating swipe:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const undoLastSwipe = async () => {
    if (!user || !lastSwipe) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('swipes')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', lastSwipe.movieId);

      if (error) throw error;

      setLastSwipe(null);
      return true;
    } catch (err) {
      console.error('Error undoing swipe:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSwipe,
    undoLastSwipe,
    loading,
    canUndo: lastSwipe !== null,
  };
};
