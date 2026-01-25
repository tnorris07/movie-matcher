import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import type { Movie } from '../../types';
import { Button } from '../common/Button';
import { Star, Clock, Play, X, Heart, ThumbsUp, ThumbsDown } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onCardClick?: () => void;
}

export const MovieCard = ({ movie, onSwipe }: MovieCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-200, 200], [10, -10]);
  const rotateZ = useTransform(x, [-200, 200], [-10, 10]);
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

  useEffect(() => {
    if (isFlipped && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      }, 50);
    }
  }, [isFlipped]);

  return (
    <>
      {/* Mobile & Desktop unified layout */}
      <div className="absolute left-0 right-0 bottom-28 pointer-events-none z-20 px-4 md:px-[5%] flex items-start justify-center pt-4" style={{ top: '80px' }}>
        <motion.div
          drag={!isFlipped}
          dragConstraints={!isFlipped ? { left: 0, right: 0, top: 0, bottom: 0 } : undefined}
          onDragEnd={!isFlipped ? handleDragEnd : undefined}
          style={{ x, y, rotateX, rotateZ, opacity }}
          className="w-full max-w-sm pointer-events-auto cursor-grab active:cursor-grabbing z-20"
          whileTap={{ cursor: 'grabbing' }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <AnimatePresence mode="wait">
            {!isFlipped && (
              /* Front of card */
              <motion.div
                key="front"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: 90 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div
                  className="bg-white rounded-3xl shadow-card overflow-hidden cursor-pointer transition-shadow hover:shadow-card-hover"
                  style={{ maxWidth: '384px', margin: '0 auto' }}
                  onClick={toggleFlip}
                >
                  {/* Drag direction indicators */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-red-500/90 z-10 rounded-3xl"
                    style={{ opacity: leftOpacity }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <X className="w-16 h-16 text-white" strokeWidth={3} />
                      <span className="text-white text-xl font-bold">Pass</span>
                    </div>
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-emerald-500/90 z-10 rounded-3xl"
                    style={{ opacity: rightOpacity }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Heart className="w-16 h-16 text-white" strokeWidth={2} fill="white" />
                      <span className="text-white text-xl font-bold">Like</span>
                    </div>
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-blue-500/90 z-10 rounded-3xl"
                    style={{ opacity: upOpacity }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ThumbsUp className="w-16 h-16 text-white" strokeWidth={2} />
                      <span className="text-white text-xl font-bold">Seen & Liked</span>
                    </div>
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-secondary-500/90 z-10 rounded-3xl"
                    style={{ opacity: downOpacity }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ThumbsDown className="w-16 h-16 text-white" strokeWidth={2} />
                      <span className="text-white text-xl font-bold">Seen & Disliked</span>
                    </div>
                  </motion.div>

                  {/* Movie Poster */}
                  <div className="relative aspect-[2/3] max-h-[400px] overflow-hidden">
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Rating badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-soft">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-secondary-800 font-bold text-sm">
                          {movie.tmdb_rating.toFixed(1)}
                        </span>
                      </div>
                      {movie.rt_score && (
                        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-soft">
                          <span className="text-base">🍅</span>
                          <span className="text-secondary-800 font-bold text-sm">
                            {movie.rt_score}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Title overlay at bottom of image */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                        {movie.title}
                      </h2>
                      <div className="flex items-center gap-3 text-white/90 text-sm">
                        <span>{movie.year}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {movie.runtime} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                    <p className="text-secondary-500 text-sm text-center">
                      Tap card for details • Swipe to decide
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            {isFlipped && (
              /* Back of card - Details */
              <motion.div
                key="back"
                initial={{ rotateY: -90 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: 90 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div
                  className="bg-white rounded-3xl shadow-card overflow-hidden cursor-pointer"
                  style={{ maxWidth: '384px', margin: '0 auto', height: '580px' }}
                  onClick={toggleFlip}
                >
                  <div
                    ref={scrollRef}
                    className="overflow-y-auto h-full p-6 space-y-5"
                  >
                    {/* Header */}
                    <div>
                      <h2 className="text-2xl font-bold text-secondary-800 mb-1">
                        {movie.title}
                      </h2>
                      <div className="flex items-center gap-3 text-secondary-500 text-sm">
                        <span>{movie.year}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {movie.runtime} min
                        </span>
                      </div>
                    </div>

                    {/* Ratings */}
                    <div className="flex gap-6 p-4 bg-secondary-50 rounded-2xl">
                      <div className="text-center">
                        <p className="text-xs text-secondary-400 mb-1">TMDB</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-secondary-800 font-bold">
                            {movie.tmdb_rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      {movie.imdb_rating && (
                        <div className="text-center">
                          <p className="text-xs text-secondary-400 mb-1">IMDb</p>
                          <p className="text-secondary-800 font-bold">
                            {movie.imdb_rating.toFixed(1)}
                          </p>
                        </div>
                      )}
                      {movie.rt_score && (
                        <div className="text-center">
                          <p className="text-xs text-secondary-400 mb-1">RT</p>
                          <p className="text-secondary-800 font-bold">{movie.rt_score}%</p>
                        </div>
                      )}
                    </div>

                    {/* Director */}
                    <div>
                      <p className="text-xs text-secondary-400 mb-1 font-medium uppercase tracking-wide">
                        Directed by
                      </p>
                      <p className="text-secondary-700">{movie.director}</p>
                    </div>

                    {/* Cast */}
                    <div>
                      <p className="text-xs text-secondary-400 mb-1 font-medium uppercase tracking-wide">
                        Cast
                      </p>
                      <p className="text-secondary-700">{movie.movie_cast.slice(0, 5).join(', ')}</p>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    {/* Synopsis */}
                    <div>
                      <p className="text-xs text-secondary-400 mb-2 font-medium uppercase tracking-wide">
                        Synopsis
                      </p>
                      <p className="text-secondary-600 text-sm leading-relaxed">
                        {movie.plot_synopsis}
                      </p>
                    </div>

                    {/* Trailer Button */}
                    {movie.trailer_url && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(movie.trailer_url!, '_blank');
                        }}
                        variant="outline"
                        size="md"
                        fullWidth
                      >
                        <Play className="w-4 h-4" />
                        Watch Trailer
                      </Button>
                    )}

                    {/* Tap hint */}
                    <p className="text-secondary-400 text-sm text-center pt-2">
                      Tap to flip back
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};
