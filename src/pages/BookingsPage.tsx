
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import { toast } from '@/hooks/use-toast';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

interface Booking {
  id: string;
  total_amount: number;
  booking_status: string;
  created_at: string;
  shows: {
    show_time: string;
    movies: {
      title: string;
      poster_url?: string;
    };
    screens: {
      name: string;
    };
  };
  booking_seats: {
    seats: {
      row_number: number;
      seat_number: number;
    };
  }[];
}

const BookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          shows:show_id (
            show_time,
            movies:movie_id (
              title,
              poster_url
            ),
            screens:screen_id (
              name
            )
          ),
          booking_seats (
            seats:seat_id (
              row_number,
              seat_number
            )
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatSeatList = (seats: { row_number: number; seat_number: number }[]) => {
    return seats
      .map(seat => `${String.fromCharCode(64 + seat.row_number)}${seat.seat_number}`)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View your movie ticket booking history</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600">Start by booking your first movie ticket!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-32 bg-gradient-to-br from-purple-100 to-blue-100">
                    {booking.shows.movies.poster_url ? (
                      <img
                        src={booking.shows.movies.poster_url}
                        alt={booking.shows.movies.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 md:h-full flex items-center justify-center text-gray-500">
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{booking.shows.movies.title}</CardTitle>
                          <CardDescription>
                            Booking ID: {booking.id.slice(0, 8)}...
                          </CardDescription>
                        </div>
                        <Badge variant={booking.booking_status === 'confirmed' ? 'default' : 'destructive'}>
                          {booking.booking_status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>
                            {new Date(booking.shows.show_time).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {new Date(booking.shows.show_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{booking.shows.screens.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{booking.booking_seats.length} seat(s)</span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">Seats:</p>
                            <p className="font-medium">
                              {formatSeatList(booking.booking_seats.map(bs => bs.seats))}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-xl font-bold text-green-600">
                              ${booking.total_amount}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
