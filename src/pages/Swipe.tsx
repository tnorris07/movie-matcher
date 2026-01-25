import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useUnswipedMovies } from '../hooks/useMovies';
import { useSwipes } from '../hooks/useSwipes';
import { useAuth } from '../hooks/useAuth';
import { MovieCard } from '../components/swipe/MovieCard';
import { MatchNotification } from '../components/swipe/MatchNotification';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { X, Heart, ThumbsUp, ThumbsDown, Film } from 'lucide-react';
import type { SwipeType, Movie } from '../types';

export const Swipe = () => {
  const { couple } = useAuth();
  const { currentMovie, loading, nextMovie } = useUnswipedMovies();
  const { createSwipe } = useSwipes();
  const [matchedMovie, setMatchedMovie] = useState<Movie | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!couple) {
      navigate('/couple-setup');
    }
  }, [couple, navigate]);

  const handleSwipe = useCallback(async (direction: 'left' | 'right' | 'up' | 'down') => {
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
  }, [currentMovie, createSwipe, nextMovie, setMatchedMovie]);

  // Arrow key support for desktop
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentMovie) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handleSwipe('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleSwipe('right');
          break;
        case 'ArrowUp':
          event.preventDefault();
          handleSwipe('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleSwipe('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMovie, handleSwipe]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary-500 font-medium">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (!currentMovie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-50 flex items-center justify-center">
            <Film className="w-10 h-10 text-primary-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-secondary-800 mb-2">
              All caught up!
            </h2>
            <p className="text-secondary-500">
              You've seen all available movies. Check back later for more!
            </p>
          </div>
          <Button onClick={() => navigate('/watchlist')} size="lg">
            View Your Watch List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main container with gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 z-0">
        {/* Movie Card */}
        <AnimatePresence mode="wait">
          <MovieCard
            key={currentMovie.id}
            movie={currentMovie}
            onSwipe={handleSwipe}
          />
        </AnimatePresence>
      </div>

      {/* Action Buttons - fixed at bottom */}
      <div className="fixed left-0 md:left-60 right-0 z-50 flex justify-center items-center gap-3 px-4" style={{ bottom: '100px' }}>
        <Button
          onClick={() => handleSwipe('left')}
          variant="danger"
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl hover:scale-110 transition-all"
          title="Pass"
        >
          <X className="w-6 h-6" />
        </Button>

        <Button
          onClick={() => handleSwipe('down')}
          variant="secondary"
          size="icon"
          className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          title="Seen & Disliked"
        >
          <ThumbsDown className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => handleSwipe('up')}
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl hover:scale-105 transition-all bg-white"
          title="Seen & Liked"
        >
          <ThumbsUp className="w-5 h-5 text-blue-500" />
        </Button>

        <Button
          onClick={() => handleSwipe('right')}
          variant="success"
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl hover:scale-110 transition-all"
          title="Like"
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>

      {/* Action hints */}
      <div className="fixed left-0 md:left-60 right-0 z-40 flex justify-center" style={{ bottom: '70px' }}>
        <div className="flex items-center gap-6 text-xs text-secondary-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Pass
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary-400"></span>
            Seen it
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Like
          </span>
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
