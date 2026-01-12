import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMatches, useWatchedMovies } from '../hooks/useMatches';
import { supabase } from '../lib/supabase';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Profile = () => {
  const { user, couple, signOut } = useAuth();
  const { matches } = useMatches();
  const { watchedMovies } = useWatchedMovies();
  const [swipeCount, setSwipeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchSwipeCount();
  }, [user]);

  const fetchSwipeCount = async () => {
    if (!user) return;

    try {
      const { count } = await supabase
        .from('swipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setSwipeCount(count || 0);
    } catch (err) {
      console.error('Error fetching swipe count:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (couple?.invite_code) {
      const link = `${window.location.origin}/join/${couple.invite_code}`;
      navigator.clipboard.writeText(link);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center pb-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary pt-8 pb-24 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-6">Profile</h1>

        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-4">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl">
                👤
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-white">
                {user?.user_metadata?.full_name || 'User'}
              </h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-white">Your Stats</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {swipeCount}
              </div>
              <div className="text-sm text-gray-400 mt-1">Movies Swiped</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {matches.length}
              </div>
              <div className="text-sm text-gray-400 mt-1">Matches</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {watchedMovies.length}
              </div>
              <div className="text-sm text-gray-400 mt-1">Watched</div>
            </div>
          </div>
        </div>

        {couple && (
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white">Couple Info</h3>

            <div>
              <p className="text-sm text-gray-400 mb-1">Invite Code</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-900 rounded-lg px-4 py-3 text-center">
                  <p className="text-2xl font-mono font-bold text-primary tracking-wider">
                    {couple.invite_code}
                  </p>
                </div>
                <Button
                  onClick={copyInviteCode}
                  variant="secondary"
                  className="whitespace-nowrap"
                >
                  {copiedCode ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Status</p>
              <p className="text-white">
                {couple.user2_id ? (
                  <span className="text-green-400">✓ Couple Complete</span>
                ) : (
                  <span className="text-yellow-400">
                    ⚠ Waiting for partner to join
                  </span>
                )}
              </p>
            </div>

            {!couple.user2_id && (
              <div className="bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg p-4">
                <p className="text-sm text-yellow-200">
                  Share your invite code or link with your partner so they can join
                  and start matching movies with you.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-white">Settings</h3>

          <Button onClick={handleSignOut} variant="outline" fullWidth>
            Sign Out
          </Button>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>Movie Matcher v1.0</p>
          <p className="mt-1">Made with ❤️ for movie lovers</p>
        </div>
      </div>
    </div>
  );
};
