import { useState, useMemo } from 'react';
import { useMatches, useMyLikes } from '../hooks/useMatches';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Heart, Users } from 'lucide-react';
import type { Match, Movie } from '../types';

type TabType = 'matches' | 'likes';

export const WatchList = () => {
  const { matches, loading: matchesLoading, markAsWatched } = useMatches();
  const { likes, loading: likesLoading } = useMyLikes();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [runtimeFilter, setRuntimeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'runtime' | 'title'>('date');

  const loading = matchesLoading || likesLoading;

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    matches.forEach((match) => {
      if (match.movie) {
        match.movie.genres.forEach((genre) => genres.add(genre));
      }
    });
    likes.forEach((like) => {
      if (like.movie) {
        like.movie.genres.forEach((genre: string) => genres.add(genre));
      }
    });
    return Array.from(genres).sort();
  }, [matches, likes]);

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

  const filteredAndSortedLikes = useMemo(() => {
    let filtered = [...likes];

    if (genreFilter !== 'all') {
      filtered = filtered.filter(
        (like) => like.movie?.genres.includes(genreFilter)
      );
    }

    if (runtimeFilter !== 'all') {
      filtered = filtered.filter((like) => {
        if (!like.movie) return false;
        const runtime = like.movie.runtime;
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
  }, [likes, genreFilter, runtimeFilter, sortBy]);

  const handleMovieClick = (match: Match) => {
    if (match.movie) {
      setSelectedMovie(match.movie);
      setSelectedMatchId(match.id);
    }
  };

  const handleLikeClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setSelectedMatchId(null);
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center pb-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentItems = activeTab === 'matches' ? filteredAndSortedMatches : filteredAndSortedLikes;
  const totalItems = activeTab === 'matches' ? matches.length : likes.length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-secondary-800 mb-6">Watch List</h1>

          {/* Tab Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'matches'
                  ? 'bg-primary-500 text-white shadow-button'
                  : 'bg-white text-secondary-600 hover:bg-secondary-50 border border-secondary-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Matched Watches
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'matches' ? 'bg-white/20' : 'bg-secondary-100'
              }`}>
                {matches.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'likes'
                  ? 'bg-primary-500 text-white shadow-button'
                  : 'bg-white text-secondary-600 hover:bg-secondary-50 border border-secondary-200'
              }`}
            >
              <Heart className="w-4 h-4" />
              My Likes
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'likes' ? 'bg-white/20' : 'bg-secondary-100'
              }`}>
                {likes.length}
              </span>
            </button>
          </div>

          {currentItems.length === 0 && totalItems === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-card">
              <div className="text-6xl mb-4">
                {activeTab === 'matches' ? '💕' : '❤️'}
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 mb-2">
                {activeTab === 'matches' ? 'No matches yet' : 'No likes yet'}
              </h2>
              <p className="text-secondary-500">
                {activeTab === 'matches'
                  ? 'Start swiping to find movies you both want to watch'
                  : 'Swipe right on movies you want to watch'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-secondary-500 mb-1">
                      Genre
                    </label>
                    <select
                      value={genreFilter}
                      onChange={(e) => setGenreFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
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
                    <label className="block text-sm font-medium text-secondary-500 mb-1">
                      Runtime
                    </label>
                    <select
                      value={runtimeFilter}
                      onChange={(e) => setRuntimeFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                    >
                      <option value="all">Any Length</option>
                      <option value="<90">Under 90 min</option>
                      <option value="90-120">90-120 min</option>
                      <option value="120-150">120-150 min</option>
                      <option value=">150">Over 150 min</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-secondary-500 mb-1">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'rating' | 'runtime' | 'title')}
                      className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                    >
                      <option value="date">Date Added</option>
                      <option value="rating">Rating</option>
                      <option value="runtime">Runtime</option>
                      <option value="title">Title</option>
                    </select>
                  </div>
                </div>

                <div className="text-sm text-secondary-500">
                  Showing {currentItems.length} of {totalItems} movies
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {activeTab === 'matches' ? (
                  filteredAndSortedMatches.map((match) =>
                    match.movie ? (
                      <div
                        key={match.id}
                        onClick={() => handleMovieClick(match)}
                        className="cursor-pointer group"
                      >
                        <div className="relative overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-shadow aspect-[2/3]">
                          <img
                            src={match.movie.poster_url}
                            alt={match.movie.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Gradient overlay for title */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          {/* Rating badge */}
                          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-soft">
                            <span className="text-yellow-500 text-sm font-bold">
                              ★ {match.movie.tmdb_rating.toFixed(1)}
                            </span>
                          </div>
                          {/* Match badge */}
                          <div className="absolute top-2 left-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            <Users className="w-3 h-3 inline mr-1" />
                            Match
                          </div>
                          {/* Title overlay at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-white font-semibold text-sm leading-tight">
                              {match.movie.title}
                            </h3>
                            <p className="text-white/70 text-xs mt-1">
                              {match.movie.year} · {match.movie.runtime} min
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null
                  )
                ) : (
                  filteredAndSortedLikes.map((like) =>
                    like.movie ? (
                      <div
                        key={like.movie.id}
                        onClick={() => handleLikeClick(like.movie as Movie)}
                        className="cursor-pointer group"
                      >
                        <div className="relative overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-shadow aspect-[2/3]">
                          <img
                            src={like.movie.poster_url}
                            alt={like.movie.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Gradient overlay for title */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          {/* Rating badge */}
                          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-soft">
                            <span className="text-yellow-500 text-sm font-bold">
                              ★ {like.movie.tmdb_rating.toFixed(1)}
                            </span>
                          </div>
                          {/* Liked badge */}
                          <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            <Heart className="w-3 h-3 inline mr-1" fill="white" />
                            Liked
                          </div>
                          {/* Title overlay at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-white font-semibold text-sm leading-tight">
                              {like.movie.title}
                            </h3>
                            <p className="text-white/70 text-xs mt-1">
                              {like.movie.year} · {like.movie.runtime} min
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null
                  )
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
              className="w-full h-64 object-cover rounded-xl"
            />

            <div>
              <h2 className="text-2xl font-bold text-secondary-800 mb-1">
                {selectedMovie.title}
              </h2>
              <p className="text-secondary-500">
                {selectedMovie.year} · {selectedMovie.runtime} min
              </p>
            </div>

            <div className="flex gap-4">
              <div>
                <p className="text-sm text-secondary-400">TMDB</p>
                <p className="text-yellow-500 font-bold">
                  {selectedMovie.tmdb_rating.toFixed(1)}/10
                </p>
              </div>
              {selectedMovie.imdb_rating && (
                <div>
                  <p className="text-sm text-secondary-400">IMDb</p>
                  <p className="text-yellow-500 font-bold">
                    {selectedMovie.imdb_rating.toFixed(1)}/10
                  </p>
                </div>
              )}
              {selectedMovie.rt_score && (
                <div>
                  <p className="text-sm text-secondary-400">RT</p>
                  <p className="text-yellow-500 font-bold">
                    {selectedMovie.rt_score}%
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-secondary-400">Director</p>
              <p className="text-secondary-700">{selectedMovie.director}</p>
            </div>

            <div>
              <p className="text-sm text-secondary-400">Cast</p>
              <p className="text-secondary-700">{selectedMovie.movie_cast.join(', ')}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedMovie.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-primary-50 text-primary-600 text-sm rounded-full font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div>
              <p className="text-sm text-secondary-400 mb-1">Synopsis</p>
              <p className="text-secondary-600">{selectedMovie.plot_synopsis}</p>
            </div>

            <div className="space-y-2">
              {selectedMovie.trailer_url && (
                <Button
                  onClick={() => window.open(selectedMovie.trailer_url!, '_blank')}
                  variant="outline"
                  fullWidth
                >
                  Watch Trailer
                </Button>
              )}

              {selectedMatchId && (
                <Button onClick={handleMarkAsWatched} fullWidth>
                  Mark as Watched
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
