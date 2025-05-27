
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';

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

interface MovieCardProps {
  movie: Movie;
  onBookNow: (movieId: string) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onBookNow }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[2/3] bg-gradient-to-br from-purple-100 to-blue-100 relative">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <span className="text-4xl">🎬</span>
          </div>
        )}
        {movie.rating && (
          <Badge className="absolute top-2 right-2" variant="secondary">
            {movie.rating}
          </Badge>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">{movie.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {movie.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{movie.duration_minutes} min</span>
          </div>
          {movie.release_date && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(movie.release_date).getFullYear()}</span>
            </div>
          )}
        </div>
        
        <Badge variant="outline">{movie.genre}</Badge>
        
        <Button 
          className="w-full" 
          onClick={() => onBookNow(movie.id)}
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
