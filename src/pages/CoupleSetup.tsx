import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';

export const CoupleSetup = () => {
  const { createCouple, joinCouple } = useAuth();
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateCouple = async () => {
    try {
      setLoading(true);
      setError(null);
      const couple = await createCouple();
      setGeneratedCode(couple.invite_code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create couple');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCouple = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await joinCouple(inviteCode);
      navigate('/swipe');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join couple');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${generatedCode}`;
    navigator.clipboard.writeText(link);
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Set Up Your Couple
            </h1>
            <p className="text-gray-400">
              Create a new couple or join using an invite code
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => setMode('create')}
              fullWidth
              size="lg"
            >
              Create New Couple
            </Button>

            <Button
              onClick={() => setMode('join')}
              variant="outline"
              fullWidth
              size="lg"
            >
              Join with Invite Code
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <button
            onClick={() => setMode('select')}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Your Couple
            </h1>
            <p className="text-gray-400">
              Generate an invite code to share with your partner
            </p>
          </div>

          {!generatedCode ? (
            <div className="bg-gray-800 rounded-lg p-8 space-y-6">
              {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button
                onClick={handleCreateCouple}
                disabled={loading}
                fullWidth
                size="lg"
              >
                {loading ? 'Creating...' : 'Generate Invite Code'}
              </Button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Your Invite Code
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <p className="text-3xl font-mono font-bold text-primary tracking-wider">
                    {generatedCode}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={copyInviteLink} variant="secondary" fullWidth>
                  Copy Invite Link
                </Button>

                <Button onClick={() => navigate('/swipe')} fullWidth>
                  Start Swiping
                </Button>
              </div>

              <div className="text-sm text-gray-400 text-center">
                Share this code with your partner so they can join
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <button
          onClick={() => setMode('select')}
          className="text-gray-400 hover:text-white mb-4"
        >
          ← Back
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Join Your Partner
          </h1>
          <p className="text-gray-400">
            Enter the invite code your partner shared
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="XXXXXXXX"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-center text-xl font-mono tracking-wider focus:outline-none focus:border-primary"
              maxLength={8}
            />
          </div>

          <Button
            onClick={handleJoinCouple}
            disabled={loading || !inviteCode.trim()}
            fullWidth
            size="lg"
          >
            {loading ? 'Joining...' : 'Join Couple'}
          </Button>
        </div>
      </div>
    </div>
  );
};
