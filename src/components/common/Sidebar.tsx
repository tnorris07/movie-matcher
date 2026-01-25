import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

export const Sidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:block fixed left-0 top-0 h-screen w-60 bg-[#9CAF88] border-r border-gray-300 flex flex-col z-50">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-300">
        <div className="flex flex-col items-center space-y-3">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="User"
              className="w-16 h-16 rounded-full border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl shadow-md">
              👤
            </div>
          )}
          <div className="text-center">
            <p className="text-gray-900 font-semibold text-sm">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-gray-700 text-xs truncate max-w-[200px]">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => navigate('/profile')}
          className="w-full px-4 py-2 text-left text-gray-900 hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>👤</span>
          <span>View Profile</span>
        </button>

        <button
          disabled
          className="w-full px-4 py-2 text-left text-gray-600 cursor-not-allowed rounded-lg flex items-center space-x-2"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-gray-300">
        <Button
          onClick={signOut}
          variant="outline"
          fullWidth
          size="sm"
          className="border-gray-900 text-gray-900 hover:bg-white/20"
        >
          Sign Out
        </Button>
      </div>
    </aside>
  );
};
