import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import type { Movie } from '../../types';
import { Button } from '../common/Button';

interface MovieCardProps {
  movie: Movie;
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onCardClick?: () => void;
}

export const MovieCard = ({ movie, onSwipe }: MovieCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-200, 200], [15, -15]);
  const rotateZ = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Visual feedback for drag direction
  const leftOpacity = useTransform(x, [0, -100], [0, 1]);
  const rightOpacity = useTransform(x, [0, 100], [0, 1]);
  const upOpacity = useTransform(y, [0, -100], [0, 1]);
  const downOpacity = useTransform(y, [0, 100], [0, 1]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocity = 800;

    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > velocity) {
      if (info.offset.x > 0) {
        onSwipe('right');
      } else {
        onSwipe('left');
      }
    } else if (Math.abs(info.offset.y) > threshold || Math.abs(info.velocity.y) > velocity) {
      if (info.offset.y > 0) {
        onSwipe('down');
      } else {
        onSwipe('up');
      }
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <>
      {/* Mobile & Desktop unified layout */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none z-20 md:p-8">
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragEnd={handleDragEnd}
          style={{ x, y, rotateX, rotateZ, opacity }}
          className="w-full max-w-sm pointer-events-auto cursor-grab active:cursor-grabbing z-20"
          whileTap={{ cursor: 'grabbing' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ perspective: '2000px' }}>
            <motion.div
              className="relative w-full"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front of card */}
              <div
                className="w-full"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                <div className="bg-black rounded-3xl shadow-2xl overflow-hidden" onClick={toggleFlip}>
                  {/* Drag direction indicators */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-80 z-10 rounded-3xl"
                    style={{ opacity: leftOpacity }}
                  >
                    <span className="text-white text-6xl font-bold">✕</span>
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-80 z-10 rounded-3xl"
                    style={{ opacity: rightOpacity }}
                  >
                    <span className="text-white text-6xl font-bold">❤️</span>
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-80 z-10 rounded-3xl"
                    style={{ opacity: upOpacity }}
                  >
                    <span className="text-white text-4xl font-bold">👍 Seen</span>
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-80 z-10 rounded-3xl"
                    style={{ opacity: downOpacity }}
                  >
                    <span className="text-white text-4xl font-bold">👎 Seen</span>
                  </motion.div>

                  <div className="relative">
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-full h-[500px] object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-black bg-opacity-90 px-3 py-1.5 rounded-full">
                      <span className="text-yellow-400 font-bold text-sm">
                        ⭐ {movie.tmdb_rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 bg-black">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {movie.title}
                    </h2>
                    <p className="text-gray-400 text-sm mb-3">
                      {movie.year} · {movie.runtime} min
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {movie.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                    <div className="text-center text-sm text-gray-400 pt-2 border-t border-gray-800">
                      Tap to see details
                    </div>
                  </div>
                </div>
              </div>

              {/* Back of card - Details */}
              <div
                className="absolute top-0 left-0 w-full"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="bg-black rounded-3xl shadow-2xl overflow-hidden max-h-[700px] flex flex-col">
                  <div
                    className="p-6 overflow-y-auto flex-1 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {movie.title}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {movie.year} · {movie.runtime} min
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-gray-400">TMDB</p>
                        <p className="text-yellow-400 font-bold">
                          {movie.tmdb_rating.toFixed(1)}/10
                        </p>
                      </div>
                      {movie.imdb_rating && (
                        <div>
                          <p className="text-xs text-gray-400">IMDb</p>
                          <p className="text-yellow-400 font-bold">
                            {movie.imdb_rating.toFixed(1)}/10
                          </p>
                        </div>
                      )}
                      {movie.rt_score && (
                        <div>
                          <p className="text-xs text-gray-400">RT</p>
                          <p className="text-yellow-400 font-bold">{movie.rt_score}%</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Directed by</p>
                      <p className="text-white text-sm">{movie.director}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Cast</p>
                      <p className="text-white text-sm">{movie.movie_cast.slice(0, 5).join(', ')}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">Synopsis</p>
                      <p className="text-white text-sm leading-relaxed">{movie.plot_synopsis}</p>
                    </div>

                    {movie.trailer_url && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(movie.trailer_url!, '_blank');
                        }}
                        variant="secondary"
                        size="sm"
                        fullWidth
                      >
                        Watch Trailer
                      </Button>
                    )}
                  </div>
                  <div
                    className="p-4 bg-gray-900 border-t border-gray-800 text-center text-sm text-gray-400 cursor-pointer"
                    onClick={toggleFlip}
                  >
                    Tap to flip back
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
