import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useUnswipedMovies } from '../hooks/useMovies';
import { useSwipes } from '../hooks/useSwipes';
import { useAuth } from '../hooks/useAuth';
import { MovieCard } from '../components/swipe/MovieCard';
import { MatchNotification } from '../components/swipe/MatchNotification';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import type { SwipeType, Movie } from '../types';

export const Swipe = () => {
  const { couple } = useAuth();
  const { currentMovie, loading, nextMovie, refetch } = useUnswipedMovies();
  const { createSwipe, undoLastSwipe, canUndo } = useSwipes();
  const [matchedMovie, setMatchedMovie] = useState<Movie | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!couple) {
      navigate('/couple-setup');
    }
  }, [couple, navigate]);

  const handleSwipe = async (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!currentMovie) {
      console.log('No current movie');
      return;
    }

    console.log('Swiping', direction, 'on movie:', currentMovie.title);

    const swipeTypeMap: Record<string, SwipeType> = {
      left: 'no',
      right: 'yes',
      up: 'seen_yes',
      down: 'seen_no',
    };

    const swipeType = swipeTypeMap[direction];

    try {
      const result = await createSwipe(currentMovie.id, swipeType);
      console.log('Swipe result:', result);

      if (result.match?.movie) {
        console.log('Match found!', result.match.movie.title);
        setMatchedMovie(result.match.movie);
      }

      console.log('Moving to next movie');
      nextMovie();
    } catch (err) {
      console.error('Error swiping:', err);
      alert('Error saving swipe: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleUndo = async () => {
    try {
      await undoLastSwipe();
      await refetch();
    } catch (err) {
      console.error('Error undoing swipe:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentMovie) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="text-6xl">🎬</div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No more movies
            </h2>
            <p className="text-gray-400">
              You've seen all available movies. Check back later for more!
            </p>
          </div>
          <Button onClick={() => navigate('/watchlist')}>
            View Your Watch List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-secondary overflow-hidden">
        {/* Header - fixed position */}
        <div className="fixed top-0 left-0 right-0 z-10 bg-secondary pt-4 pb-2 px-4">
          <div className="flex justify-between items-center max-w-md mx-auto md:max-w-2xl">
            <h1 className="text-xl md:text-2xl font-bold text-white">Discover Movies</h1>
            {canUndo && (
              <Button onClick={handleUndo} variant="secondary" size="sm">
                Undo
              </Button>
            )}
          </div>
        </div>

        {/* Movie Card */}
        <AnimatePresence mode="wait">
          <MovieCard
            key={currentMovie.id}
            movie={currentMovie}
            onSwipe={handleSwipe}
          />
        </AnimatePresence>

        {/* Action Buttons - fixed at bottom on mobile, centered on desktop */}
        <div className="fixed bottom-24 left-0 right-0 z-10 px-4 md:bottom-8">
          <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-sm mx-auto md:max-w-md">
            <Button
              onClick={() => handleSwipe('left')}
              variant="secondary"
              size="lg"
              fullWidth
            >
              ✕ Skip
            </Button>
            <Button
              onClick={() => handleSwipe('right')}
              variant="primary"
              size="lg"
              fullWidth
            >
              ❤️ Want to Watch
            </Button>
            <Button
              onClick={() => handleSwipe('down')}
              variant="outline"
              size="sm"
              fullWidth
            >
              ↓ Seen & No
            </Button>
            <Button
              onClick={() => handleSwipe('up')}
              variant="outline"
              size="sm"
              fullWidth
            >
              ↑ Seen & Yes
            </Button>
          </div>

          {!couple?.user2_id && (
            <div className="mt-6 bg-blue-900 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg">
              <p className="text-sm">
                <strong>Solo mode:</strong> Your swipes are being saved! When your partner joins with code{' '}
                <span className="font-mono font-bold">{couple?.invite_code}</span>, you'll see matches automatically.
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {matchedMovie && (
          <MatchNotification
            movie={matchedMovie}
            onClose={() => setMatchedMovie(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
