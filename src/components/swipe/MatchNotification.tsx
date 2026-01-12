import { motion } from 'framer-motion';
import type { Movie } from '../../types';
import { Button } from '../common/Button';

interface MatchNotificationProps {
  movie: Movie;
  onClose: () => void;
}

export const MatchNotification = ({ movie, onClose }: MatchNotificationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90"
    >
      <div className="max-w-md w-full bg-gradient-to-br from-primary to-red-700 rounded-2xl p-8 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-8xl"
        >
          🎉
        </motion.div>

        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            It's a Match!
          </h2>
          <p className="text-white text-opacity-90">
            You both want to watch
          </p>
        </div>

        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-32 h-48 object-cover rounded-lg mx-auto mb-3"
          />
          <h3 className="text-xl font-bold text-white">{movie.title}</h3>
          <p className="text-white text-opacity-80 text-sm">
            {movie.year} · {movie.runtime} min
          </p>
        </div>

        <p className="text-white text-sm">
          This movie has been added to your Watch List
        </p>

        <Button onClick={onClose} variant="outline" fullWidth size="lg">
          Keep Swiping
        </Button>
      </div>
    </motion.div>
  );
};
