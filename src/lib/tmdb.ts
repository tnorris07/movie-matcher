const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genre_ids: number[];
  runtime?: number;
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genres: { id: number; name: string }[];
  runtime: number;
  credits: {
    cast: { id: number; name: string; character: string; order: number }[];
    crew: { id: number; name: string; job: string }[];
  };
  videos: {
    results: { key: string; site: string; type: string }[];
  };
  tagline: string;
  imdb_id: string | null;
}

const fetchTMDB = async (endpoint: string, params: Record<string, string> = {}) => {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
};

export const getPopularMovies = async (page: number = 1): Promise<TMDBMovie[]> => {
  const data = await fetchTMDB('/movie/popular', { page: page.toString() });
  return data.results;
};

export const getTopRatedMovies = async (page: number = 1): Promise<TMDBMovie[]> => {
  const data = await fetchTMDB('/movie/top_rated', { page: page.toString() });
  return data.results;
};

export const getMoviesByYear = async (year: number, page: number = 1): Promise<TMDBMovie[]> => {
  const data = await fetchTMDB('/discover/movie', {
    page: page.toString(),
    'primary_release_year': year.toString(),
    'sort_by': 'vote_average.desc',
    'vote_count.gte': '100'
  });
  return data.results;
};

export const getMovieDetails = async (movieId: number): Promise<TMDBMovieDetails> => {
  const data = await fetchTMDB(`/movie/${movieId}`, {
    append_to_response: 'credits,videos'
  });
  return data;
};

export const discoverMovies = async (params: {
  page?: number;
  sortBy?: string;
  voteAverageGte?: number;
  voteCountGte?: number;
  releaseDateGte?: string;
  releaseDateLte?: string;
  withGenres?: string;
}): Promise<TMDBMovie[]> => {
  const queryParams: Record<string, string> = {
    page: (params.page || 1).toString(),
    sort_by: params.sortBy || 'vote_average.desc',
  };

  if (params.voteAverageGte) queryParams['vote_average.gte'] = params.voteAverageGte.toString();
  if (params.voteCountGte) queryParams['vote_count.gte'] = params.voteCountGte.toString();
  if (params.releaseDateGte) queryParams['primary_release_date.gte'] = params.releaseDateGte;
  if (params.releaseDateLte) queryParams['primary_release_date.lte'] = params.releaseDateLte;
  if (params.withGenres) queryParams['with_genres'] = params.withGenres;

  const data = await fetchTMDB('/discover/movie', queryParams);
  return data.results;
};

export const getPosterUrl = (path: string | null): string => {
  if (!path) return '/placeholder-movie.png';
  return `${TMDB_IMAGE_BASE_URL}${path}`;
};

export const getYouTubeTrailerUrl = (videos: { key: string; site: string; type: string }[]): string | null => {
  const trailer = videos.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer'
  );
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
};

export const getDirector = (crew: { name: string; job: string }[]): string => {
  const director = crew.find((person) => person.job === 'Director');
  return director?.name || 'Unknown';
};

export const getTopCast = (cast: { name: string; order: number }[], count: number = 4): string[] => {
  return cast
    .sort((a, b) => a.order - b.order)
    .slice(0, count)
    .map((actor) => actor.name);
};
