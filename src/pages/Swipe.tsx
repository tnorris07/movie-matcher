import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useUnswipedMovies } from '../hooks/useMovies';
import { useSwipes } from '../hooks/useSwipes';
import { useAuth } from '../hooks/useAuth';
import { MovieCard } from '../components/swipe/MovieCard';
import type { MovieCardRef } from '../components/swipe/MovieCard';
import { MatchNotification } from '../components/swipe/MatchNotification';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { X, Heart, ThumbsUp, ThumbsDown, Film, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import type { SwipeType, Movie } from '../types';

export const Swipe = () => {
  const { couple } = useAuth();
  const { currentMovie, loading, nextMovie } = useUnswipedMovies();
  const { createSwipe } = useSwipes();
  const [matchedMovie, setMatchedMovie] = useState<Movie | null>(null);
  const navigate = useNavigate();
  const movieCardRef = useRef<MovieCardRef>(null);

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

  // Handle button clicks - trigger animation then swipe
  const handleButtonSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (movieCardRef.current) {
      movieCardRef.current.triggerSwipe(direction);
    } else {
      handleSwipe(direction);
    }
  }, [handleSwipe]);

  // Arrow key support for desktop - with animations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentMovie) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handleButtonSwipe('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleButtonSwipe('right');
          break;
        case 'ArrowUp':
          event.preventDefault();
          handleButtonSwipe('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleButtonSwipe('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMovie, handleButtonSwipe]);

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
            ref={movieCardRef}
            movie={currentMovie}
            onSwipe={handleSwipe}
          />
        </AnimatePresence>
      </div>

      {/* Action Buttons - fixed at bottom */}
      <div className="fixed left-0 right-0 z-50 flex justify-center items-end gap-3 px-4" style={{ bottom: '90px' }}>
        {/* Pass button */}
        <div className="flex flex-col items-center gap-1">
          <Button
            onClick={() => handleButtonSwipe('left')}
            variant="danger"
            size="icon"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl hover:scale-110 transition-all"
            title="Pass (Left Arrow)"
          >
            <X className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-1 text-xs text-secondary-400">
            <ArrowLeft className="w-3 h-3" />
            <span>Pass</span>
          </div>
        </div>

        {/* Seen & Disliked button */}
        <div className="flex flex-col items-center gap-1">
          <Button
            onClick={() => handleButtonSwipe('down')}
            variant="secondary"
            size="icon"
            className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            title="Seen & Disliked (Down Arrow)"
          >
            <ThumbsDown className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-1 text-xs text-secondary-400">
            <ArrowDown className="w-3 h-3" />
            <span>Seen</span>
          </div>
        </div>

        {/* Seen & Liked button */}
        <div className="flex flex-col items-center gap-1">
          <Button
            onClick={() => handleButtonSwipe('up')}
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl hover:scale-105 transition-all bg-white"
            title="Seen & Liked (Up Arrow)"
          >
            <ThumbsUp className="w-5 h-5 text-blue-500" />
          </Button>
          <div className="flex items-center gap-1 text-xs text-secondary-400">
            <ArrowUp className="w-3 h-3" />
            <span>Loved</span>
          </div>
        </div>

        {/* Like button */}
        <div className="flex flex-col items-center gap-1">
          <Button
            onClick={() => handleButtonSwipe('right')}
            variant="success"
            size="icon"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl hover:scale-110 transition-all"
            title="Like (Right Arrow)"
          >
            <Heart className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-1 text-xs text-secondary-400">
            <ArrowRight className="w-3 h-3" />
            <span>Like</span>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="fixed left-0 right-0 z-40 flex justify-center" style={{ bottom: '60px' }}>
        <div className="text-xs text-secondary-400 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
          Use arrow keys to swipe
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
