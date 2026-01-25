import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 hover:border-primary transition-colors overflow-hidden"
      >
        {user?.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="User"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-xl">👤</span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-300 overflow-hidden">
          {/* User Info Section */}
          <div className="p-4 border-b border-gray-300">
            <div className="flex items-center space-x-3">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg">
                  👤
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium truncate">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-gray-600 text-sm truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <span>👤</span>
              <span>View Profile</span>
            </button>

            <button
              disabled
              className="w-full px-4 py-2 text-left text-gray-400 cursor-not-allowed flex items-center space-x-2"
            >
              <span>⚙️</span>
              <span>Settings (Coming Soon)</span>
            </button>
          </div>

          {/* Sign Out Button */}
          <div className="p-3 border-t border-gray-300">
            <Button
              onClick={handleSignOut}
              variant="outline"
              fullWidth
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
