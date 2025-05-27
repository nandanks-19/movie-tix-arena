
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MovieCard from '@/components/movies/MovieCard';
import Navbar from '@/components/layout/Navbar';
import { toast } from '@/hooks/use-toast';

interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string;
  duration_minutes: number;
  poster_url?: string;
  rating?: string;
  release_date?: string;
}

const MoviesPage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovies(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch movies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (movieId: string) => {
    navigate(`/shows/${movieId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 aspect-[2/3] rounded-t-lg"></div>
                <div className="bg-white p-4 rounded-b-lg space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Now Showing</h1>
          <p className="text-gray-600">Choose from our latest movie collection</p>
        </div>

        {movies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No movies available</h3>
            <p className="text-gray-600">Check back later for new releases!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onBookNow={handleBookNow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
