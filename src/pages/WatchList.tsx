import { useState, useMemo } from 'react';
import { useMatches } from '../hooks/useMatches';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import type { Match, Movie } from '../types';

export const WatchList = () => {
  const { matches, loading, markAsWatched } = useMatches();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [runtimeFilter, setRuntimeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'runtime' | 'title'>('date');

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    matches.forEach((match) => {
      if (match.movie) {
        match.movie.genres.forEach((genre) => genres.add(genre));
      }
    });
    return Array.from(genres).sort();
  }, [matches]);

  const filteredAndSortedMatches = useMemo(() => {
    let filtered = [...matches];

    if (genreFilter !== 'all') {
      filtered = filtered.filter(
        (match) => match.movie?.genres.includes(genreFilter)
      );
    }

    if (runtimeFilter !== 'all') {
      filtered = filtered.filter((match) => {
        if (!match.movie) return false;
        const runtime = match.movie.runtime;
        switch (runtimeFilter) {
          case '<90':
            return runtime < 90;
          case '90-120':
            return runtime >= 90 && runtime <= 120;
          case '120-150':
            return runtime > 120 && runtime <= 150;
          case '>150':
            return runtime > 150;
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'rating':
          return (b.movie?.tmdb_rating || 0) - (a.movie?.tmdb_rating || 0);
        case 'runtime':
          return (a.movie?.runtime || 0) - (b.movie?.runtime || 0);
        case 'title':
          return (a.movie?.title || '').localeCompare(b.movie?.title || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [matches, genreFilter, runtimeFilter, sortBy]);

  const handleMovieClick = (match: Match) => {
    if (match.movie) {
      setSelectedMovie(match.movie);
      setSelectedMatchId(match.id);
    }
  };

  const handleMarkAsWatched = async () => {
    if (selectedMatchId) {
      await markAsWatched(selectedMatchId);
      setSelectedMovie(null);
      setSelectedMatchId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center pb-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-secondary pt-8 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Our Watch List</h1>

          {matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❤️</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No matches yet
              </h2>
              <p className="text-gray-400">
                Start swiping to find movies you both want to watch
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Genre
                    </label>
                    <select
                      value={genreFilter}
                      onChange={(e) => setGenreFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                      <option value="all">All Genres</option>
                      {allGenres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Runtime
                    </label>
                    <select
                      value={runtimeFilter}
                      onChange={(e) => setRuntimeFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                      <option value="all">Any Length</option>
                      <option value="<90">Under 90 min</option>
                      <option value="90-120">90-120 min</option>
                      <option value="120-150">120-150 min</option>
                      <option value=">150">Over 150 min</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                      <option value="date">Date Added</option>
                      <option value="rating">Rating</option>
                      <option value="runtime">Runtime</option>
                      <option value="title">Title</option>
                    </select>
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  Showing {filteredAndSortedMatches.length} of {matches.length} movies
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAndSortedMatches.map((match) =>
                  match.movie ? (
                    <div
                      key={match.id}
                      onClick={() => handleMovieClick(match)}
                      className="cursor-pointer group"
                    >
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={match.movie.poster_url}
                          alt={match.movie.title}
                          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded-full">
                          <span className="text-yellow-400 text-sm font-bold">
                            {match.movie.tmdb_rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-white font-semibold line-clamp-2">
                          {match.movie.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {match.movie.year} · {match.movie.runtime} min
                        </p>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={selectedMovie !== null}
        onClose={() => {
          setSelectedMovie(null);
          setSelectedMatchId(null);
        }}
      >
        {selectedMovie && (
          <div className="space-y-4">
            <img
              src={selectedMovie.poster_url}
              alt={selectedMovie.title}
              className="w-full h-64 object-cover rounded-lg"
            />

            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {selectedMovie.title}
              </h2>
              <p className="text-gray-400">
                {selectedMovie.year} · {selectedMovie.runtime} min
              </p>
            </div>

            <div className="flex gap-4">
              <div>
                <p className="text-sm text-gray-400">TMDB</p>
                <p className="text-yellow-400 font-bold">
                  {selectedMovie.tmdb_rating.toFixed(1)}/10
                </p>
              </div>
              {selectedMovie.imdb_rating && (
                <div>
                  <p className="text-sm text-gray-400">IMDb</p>
                  <p className="text-yellow-400 font-bold">
                    {selectedMovie.imdb_rating.toFixed(1)}/10
                  </p>
                </div>
              )}
              {selectedMovie.rt_score && (
                <div>
                  <p className="text-sm text-gray-400">RT</p>
                  <p className="text-yellow-400 font-bold">
                    {selectedMovie.rt_score}%
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-400">Director</p>
              <p className="text-white">{selectedMovie.director}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Cast</p>
              <p className="text-white">{selectedMovie.movie_cast.join(', ')}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedMovie.genres.map((genre) => (
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
              <p className="text-white">{selectedMovie.plot_synopsis}</p>
            </div>

            <div className="space-y-2">
              {selectedMovie.trailer_url && (
                <Button
                  onClick={() => window.open(selectedMovie.trailer_url!, '_blank')}
                  variant="secondary"
                  fullWidth
                >
                  Watch Trailer
                </Button>
              )}

              <Button onClick={handleMarkAsWatched} fullWidth>
                Mark as Watched
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
