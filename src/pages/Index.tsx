
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Film, Ticket, Star, Clock } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/movies');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">CinemaBook</span>
          </div>
          <div className="space-x-4">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-purple-200"
                  onClick={() => navigate('/movies')}
                >
                  Movies
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-purple-200"
                  onClick={() => navigate('/bookings')}
                >
                  My Bookings
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-purple-900"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Book Your Perfect
            <span className="text-purple-300 block">Movie Experience</span>
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Discover the latest movies, select your seats, and book tickets instantly. 
            Your cinema adventure starts here.
          </p>
          <Button 
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            onClick={handleGetStarted}
          >
            {user ? 'Browse Movies' : 'Get Started'}
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Why Choose CinemaBook?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-purple-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-8 w-8 text-purple-200" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Easy Booking</h3>
            <p className="text-purple-200">
              Simple and intuitive booking process. Select your movie, choose seats, and pay securely.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-purple-200" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Best Seats</h3>
            <p className="text-purple-200">
              Interactive seat map to help you choose the perfect seats for your movie experience.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-purple-200" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Instant Confirmation</h3>
            <p className="text-purple-200">
              Get instant booking confirmation and manage all your tickets in one place.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-purple-800 bg-opacity-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Watch Your Next Favorite Movie?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of movie lovers who trust CinemaBook for their entertainment needs.
          </p>
          <Button 
            size="lg"
            className="bg-white text-purple-900 hover:bg-purple-100 px-8 py-3 text-lg"
            onClick={handleGetStarted}
          >
            Start Booking Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
