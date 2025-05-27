
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Seat {
  id: string;
  row_number: number;
  seat_number: number;
  seat_type: string;
}

interface ShowSeat {
  id: string;
  is_booked: boolean;
  is_locked: boolean;
  seats: Seat;
}

interface Show {
  id: string;
  show_time: string;
  price: number;
  movies: {
    title: string;
  };
  screens: {
    name: string;
    rows: number;
    seats_per_row: number;
  };
}

const BookingPage = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [show, setShow] = useState<Show | null>(null);
  const [showSeats, setShowSeats] = useState<ShowSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (showId) {
      fetchShowAndSeats();
    }
  }, [showId]);

  const fetchShowAndSeats = async () => {
    try {
      // Fetch show details
      const { data: showData, error: showError } = await supabase
        .from('shows')
        .select(`
          *,
          movies:movie_id (
            title
          ),
          screens:screen_id (
            name,
            rows,
            seats_per_row
          )
        `)
        .eq('id', showId)
        .single();

      if (showError) throw showError;
      setShow(showData);

      // Fetch seat availability
      const { data: seatsData, error: seatsError } = await supabase
        .from('show_seats')
        .select(`
          *,
          seats:seat_id (
            id,
            row_number,
            seat_number,
            seat_type
          )
        `)
        .eq('show_id', showId)
        .order('seats(row_number), seats(seat_number)');

      if (seatsError) throw seatsError;
      setShowSeats(seatsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch booking details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId: string, isBooked: boolean, isLocked: boolean) => {
    if (isBooked || isLocked) return;

    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleBooking = async () => {
    if (!user || selectedSeats.length === 0) return;

    setBooking(true);
    try {
      const totalAmount = selectedSeats.length * (show?.price || 0);

      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          show_id: showId!,
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update seat status
      const { error: seatUpdateError } = await supabase
        .from('show_seats')
        .update({ is_booked: true })
        .in('seat_id', selectedSeats);

      if (seatUpdateError) throw seatUpdateError;

      // Create booking_seats records
      const bookingSeats = selectedSeats.map(seatId => {
        const showSeat = showSeats.find(ss => ss.seats.id === seatId);
        return {
          booking_id: bookingData.id,
          seat_id: seatId,
          show_seat_id: showSeat!.id
        };
      });

      const { error: bookingSeatError } = await supabase
        .from('booking_seats')
        .insert(bookingSeats);

      if (bookingSeatError) throw bookingSeatError;

      toast({
        title: "Success",
        description: "Booking confirmed successfully!",
      });

      navigate('/bookings');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to complete booking",
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };

  const getSeatStatus = (seat: ShowSeat) => {
    if (seat.is_booked) return 'booked';
    if (seat.is_locked) return 'locked';
    if (selectedSeats.includes(seat.seats.id)) return 'selected';
    return 'available';
  };

  const renderSeatMap = () => {
    if (!show || showSeats.length === 0) return null;

    const rows = show.screens.rows;
    const seatsPerRow = show.screens.seats_per_row;
    const seatMap: ShowSeat[][] = Array(rows).fill(null).map(() => []);

    showSeats.forEach(showSeat => {
      const rowIndex = showSeat.seats.row_number - 1;
      if (seatMap[rowIndex]) {
        seatMap[rowIndex][showSeat.seats.seat_number - 1] = showSeat;
      }
    });

    return (
      <div className="space-y-2">
        <div className="text-center mb-6">
          <div className="bg-gray-800 text-white py-2 px-8 rounded-lg inline-block">
            SCREEN
          </div>
        </div>
        
        {seatMap.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-1">
            <div className="w-8 flex items-center justify-center text-sm font-medium text-gray-600">
              {String.fromCharCode(65 + rowIndex)}
            </div>
            {row.map((showSeat, seatIndex) => {
              if (!showSeat) return <div key={seatIndex} className="w-8 h-8" />;
              
              const status = getSeatStatus(showSeat);
              return (
                <button
                  key={showSeat.seats.id}
                  onClick={() => handleSeatClick(
                    showSeat.seats.id, 
                    showSeat.is_booked, 
                    showSeat.is_locked
                  )}
                  className={cn(
                    "w-8 h-8 text-xs font-medium rounded transition-colors",
                    {
                      'bg-green-500 text-white hover:bg-green-600': status === 'available',
                      'bg-blue-500 text-white': status === 'selected',
                      'bg-red-500 text-white cursor-not-allowed': status === 'booked',
                      'bg-yellow-500 text-white cursor-not-allowed': status === 'locked',
                    }
                  )}
                  disabled={status === 'booked' || status === 'locked'}
                >
                  {showSeat.seats.seat_number}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Show not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Seats</h1>
          <p className="text-gray-600">
            {show.movies.title} • {show.screens.name} • 
            {new Date(show.show_time).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Seat Map</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {renderSeatMap()}
                
                <div className="mt-6 flex justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Selected Seats</p>
                  <p className="font-semibold">
                    {selectedSeats.length} seat(s)
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Price per ticket</p>
                  <p className="font-semibold">${show.price}</p>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    ${(selectedSeats.length * show.price).toFixed(2)}
                  </p>
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleBooking}
                  disabled={selectedSeats.length === 0 || booking}
                >
                  {booking ? "Processing..." : "Confirm Booking"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
