
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import { toast } from '@/hooks/use-toast';
import { Clock, MapPin } from 'lucide-react';

interface Show {
  id: string;
  show_time: string;
  end_time: string;
  price: number;
  screens: {
    name: string;
  };
}

interface Movie {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  poster_url?: string;
}

const ShowsPage = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (movieId) {
      fetchMovieAndShows();
    }
  }, [movieId]);

  const fetchMovieAndShows = async () => {
    try {
      // Fetch movie details
      const { data: movieData, error: movieError } = await supabase
        .from('movies')
        .select('*')
        .eq('id', movieId)
        .single();

      if (movieError) throw movieError;
      setMovie(movieData);

      // Fetch shows for this movie
      const { data: showsData, error: showsError } = await supabase
        .from('shows')
        .select(`
          *,
          screens:screen_id (
            name
          )
        `)
        .eq('movie_id', movieId)
        .gte('show_time', new Date().toISOString())
        .order('show_time', { ascending: true });

      if (showsError) throw showsError;
      setShows(showsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch show details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShow = (showId: string) => {
    navigate(`/booking/${showId}`);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Movie not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3">
              <div className="aspect-[2/3] bg-gradient-to-br from-purple-100 to-blue-100">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <span className="text-6xl">🎬</span>
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{movie.title}</h1>
              <p className="text-gray-600 mb-4">{movie.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{movie.duration_minutes} minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Show Time</h2>
        </div>

        {shows.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No shows available</h3>
            <p className="text-gray-600">Check back later for upcoming shows!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shows.map((show) => {
              const { date, time } = formatDateTime(show.show_time);
              return (
                <Card key={show.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{date}</CardTitle>
                    <CardDescription className="text-xl font-semibold text-purple-600">
                      {time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{show.screens.name}</span>
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      ${show.price}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleSelectShow(show.id)}
                    >
                      Select Seats
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowsPage;
