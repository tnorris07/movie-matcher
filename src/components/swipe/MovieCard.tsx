import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import type { Movie } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface MovieCardProps {
  movie: Movie;
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onCardClick?: () => void;
}

export const MovieCard = ({ movie, onSwipe }: MovieCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-200, 200], [15, -15]);
  const rotateZ = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50; // Reduced from 100 to 50 for easier swiping
    const velocity = 500; // Reduced from 1000 to 500 for easier swiping

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

  return (
    <>
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotateX, rotateZ, opacity }}
        className="w-full cursor-grab active:cursor-grabbing"
        whileTap={{ cursor: 'grabbing' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden max-h-[calc(100vh-280px)] flex flex-col">
          <div className="relative flex-shrink-0">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-full h-48 sm:h-52 md:h-56 object-cover"
              onClick={() => setShowDetails(true)}
            />
            <div className="absolute top-3 right-3 bg-black bg-opacity-75 px-3 py-1 rounded-full">
              <span className="text-yellow-400 font-bold text-sm">
                {movie.tmdb_rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-2 overflow-y-auto flex-1" onClick={() => setShowDetails(true)}>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                {movie.title}
              </h2>
              <p className="text-gray-400 text-sm">
                {movie.year} · {movie.runtime} min
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Directed by</p>
              <p className="text-white text-sm">{movie.director}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Cast</p>
              <p className="text-white text-sm">{movie.movie_cast.slice(0, 3).join(', ')}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-xs text-gray-300 line-clamp-3">
              {movie.plot_synopsis}
            </p>

            <div className="text-center text-xs text-gray-500 pt-1">
              Tap for more details
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center hidden md:grid">
          <div>
            <div className="text-xl md:text-2xl">←</div>
            <div className="text-xs text-gray-400">Skip</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl">→</div>
            <div className="text-xs text-gray-400">Watch</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl">↑</div>
            <div className="text-xs text-gray-400">Seen & Yes</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl">↓</div>
            <div className="text-xs text-gray-400">Seen & No</div>
          </div>
        </div>
      </motion.div>

      <Modal isOpen={showDetails} onClose={() => setShowDetails(false)}>
        <div className="space-y-4">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-64 object-cover rounded-lg"
          />

          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {movie.title}
            </h2>
            <p className="text-gray-400">
              {movie.year} · {movie.runtime} min
            </p>
          </div>

          <div className="flex gap-4">
            <div>
              <p className="text-sm text-gray-400">TMDB</p>
              <p className="text-yellow-400 font-bold">
                {movie.tmdb_rating.toFixed(1)}/10
              </p>
            </div>
            {movie.imdb_rating && (
              <div>
                <p className="text-sm text-gray-400">IMDb</p>
                <p className="text-yellow-400 font-bold">
                  {movie.imdb_rating.toFixed(1)}/10
                </p>
              </div>
            )}
            {movie.rt_score && (
              <div>
                <p className="text-sm text-gray-400">RT</p>
                <p className="text-yellow-400 font-bold">{movie.rt_score}%</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-400">Director</p>
            <p className="text-white">{movie.director}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Cast</p>
            <p className="text-white">{movie.movie_cast.join(', ')}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Synopsis</p>
            <p className="text-white">{movie.plot_synopsis}</p>
          </div>

          {movie.trailer_url && (
            <Button
              onClick={() => window.open(movie.trailer_url!, '_blank')}
              variant="secondary"
              fullWidth
            >
              Watch Trailer
            </Button>
          )}

          <Button onClick={() => setShowDetails(false)} fullWidth>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
};
