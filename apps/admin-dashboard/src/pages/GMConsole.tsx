import { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { EventFeed } from '../components/EventFeed';
import { DeviceMonitor } from '../components/DeviceMonitor';
import { SessionControls } from '../components/SessionControls';
import { Activity, Wifi, WifiOff } from 'lucide-react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3002';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function GMConsole() {
  const [selectedRoom, setSelectedRoom] = useState('room_demo');
  const { isConnected, events } = useWebSocket({
    url: WS_URL,
    roomId: selectedRoom,
    onEvent: (event) => {
      console.log('Received event:', event);
    },
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Activity className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold">Game Master Console</h1>
            <p className="text-sm text-gray-400">Real-time Control & Monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-400">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-400">Disconnected</span>
              </>
            )}
          </div>

          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="room_demo">Demo Room</option>
            <option value="room_001">Room 001</option>
            <option value="room_002">Room 002</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Session Controls & Device Monitor */}
        <div className="lg:col-span-2 space-y-6">
          <SessionControls roomId={selectedRoom} apiUrl={API_URL} />
          <DeviceMonitor roomId={selectedRoom} events={events} />
        </div>

        {/* Right Column - Event Feed */}
        <div className="lg:col-span-1">
          <EventFeed events={events} />
        </div>
      </div>
    </div>
  );
}
