
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Film, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Film className="h-8 w-8 text-purple-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">CinemaBook</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/movies')}
                  className="text-gray-700"
                >
                  Movies
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/bookings')}
                  className="text-gray-700"
                >
                  My Bookings
                </Button>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
