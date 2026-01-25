import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const Login = () => {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setEmailLoading(true);
      setError(null);

      if (mode === 'signup') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('already registered')) {
          setError('This email is already registered. Try signing in instead.');
        } else if (err.message.includes('Invalid login')) {
          setError('Invalid email or password');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to authenticate');
      }
    } finally {
      setEmailLoading(false);
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

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'signin'
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'signup'
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                required
                minLength={6}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  required
                  minLength={6}
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={emailLoading}
              fullWidth
              size="lg"
            >
              {emailLoading
                ? (mode === 'signup' ? 'Creating Account...' : 'Signing In...')
                : (mode === 'signup' ? 'Create Account' : 'Sign In')
              }
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">OR</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            fullWidth
            size="lg"
          >
            {loading ? 'Signing in...' : 'Continue with Google'}
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
