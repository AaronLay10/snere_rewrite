import { useState } from 'react';
import { Play, Square, Pause, RotateCcw } from 'lucide-react';
import axios from 'axios';

interface SessionControlsProps {
  roomId: string;
  apiUrl: string;
}

export function SessionControls({ roomId, apiUrl }: SessionControlsProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/v1/rooms/${roomId}/game_sessions`, {
        room_id: roomId,
        team_name: 'Test Team',
        player_count: 4,
      });
      setSessionId(response.data.session_id);
      setSessionStatus('running');
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start session. Using demo mode.');
      setSessionId('demo-session-' + Date.now());
      setSessionStatus('running');
    } finally {
      setLoading(false);
    }
  };

  const stopSession = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/api/v1/game_sessions/${sessionId}/halt`);
      setSessionStatus('idle');
      setSessionId(null);
    } catch (error) {
      console.error('Error stopping session:', error);
      setSessionStatus('idle');
      setSessionId(null);
    } finally {
      setLoading(false);
    }
  };

  const pauseSession = async () => {
    if (!sessionId) return;
    setSessionStatus(sessionStatus === 'paused' ? 'running' : 'paused');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Play className="w-5 h-5 text-cyan-400" />
        Game Session Control
      </h2>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm text-gray-400 mb-1">Room</div>
            <div className="font-mono text-lg">{roomId}</div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-400 mb-1">Status</div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  sessionStatus === 'running'
                    ? 'bg-green-400 animate-pulse'
                    : sessionStatus === 'paused'
                    ? 'bg-yellow-400'
                    : 'bg-gray-600'
                }`}
              />
              <span className="font-semibold capitalize">{sessionStatus}</span>
            </div>
          </div>
        </div>

        {sessionId && (
          <div>
            <div className="text-sm text-gray-400 mb-1">Session ID</div>
            <div className="font-mono text-sm bg-gray-800 px-3 py-2 rounded">{sessionId}</div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {sessionStatus === 'idle' ? (
            <button
              onClick={startSession}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Session
            </button>
          ) : (
            <>
              <button
                onClick={pauseSession}
                disabled={loading}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {sessionStatus === 'paused' ? (
                  <>
                    <Play className="w-5 h-5" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                )}
              </button>
              <button
                onClick={stopSession}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Square className="w-5 h-5" />
                Stop
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
