import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';

export const Login = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary mb-2">🎬</h1>
          <h1 className="text-4xl font-bold text-white mb-2">Movie Matcher</h1>
          <p className="text-gray-400">
            Find the perfect movie to watch together
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 shadow-xl space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white text-center">
              Get Started
            </h2>
            <p className="text-gray-400 text-center">
              Sign in to start matching movies with your partner
            </p>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            fullWidth
            size="lg"
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            By signing in, you agree to our terms of service and privacy policy
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>How it works:</p>
          <ol className="mt-2 space-y-1 text-left max-w-xs mx-auto">
            <li>1. Sign in with Google</li>
            <li>2. Create or join a couple</li>
            <li>3. Swipe on movies independently</li>
            <li>4. See your matches and watch together</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
