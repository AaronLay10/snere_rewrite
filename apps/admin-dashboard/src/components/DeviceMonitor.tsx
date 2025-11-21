import { useMemo } from 'react';
import type { DomainEvent } from '../types/events';
import { Cpu, AlertCircle, CheckCircle, Circle } from 'lucide-react';

interface DeviceMonitorProps {
  roomId: string;
  events: DomainEvent[];
}

interface DeviceState {
  device_id: string;
  controller_id: string;
  state: any;
  last_update: string;
  event_count: number;
}

export function DeviceMonitor({ roomId, events }: DeviceMonitorProps) {
  const deviceStates = useMemo(() => {
    const states = new Map<string, DeviceState>();

    events
      .filter((e) => e.type === 'device_state_changed' && e.room_id === roomId)
      .forEach((event) => {
        if (event.device_id) {
          const existing = states.get(event.device_id);
          states.set(event.device_id, {
            device_id: event.device_id,
            controller_id: event.controller_id || 'unknown',
            state: event.payload?.new_state || event.payload?.state || {},
            last_update: event.timestamp,
            event_count: (existing?.event_count || 0) + 1,
          });
        }
      });

    return Array.from(states.values()).sort((a, b) =>
      b.last_update.localeCompare(a.last_update)
    );
  }, [events, roomId]);

  const getDeviceIcon = (state: any) => {
    if (state.pressed) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (state.open) return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    if (state.on) return <CheckCircle className="w-5 h-5 text-cyan-400" />;
    if (state.locked === false) return <AlertCircle className="w-5 h-5 text-red-400" />;
    return <Circle className="w-5 h-5 text-gray-500" />;
  };

  const formatState = (state: any) => {
    return Object.entries(state)
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return `${key}: ${value ? '✓' : '✗'}`;
        }
        if (typeof value === 'number') {
          return `${key}: ${value.toFixed(2)}`;
        }
        return `${key}: ${value}`;
      })
      .join(' | ');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Cpu className="w-5 h-5 text-cyan-400" />
        Device Monitor
        <span className="ml-auto text-sm text-gray-400">
          {deviceStates.length} devices active
        </span>
      </h2>

      {deviceStates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No device activity yet</p>
          <p className="text-sm mt-1">Waiting for device state changes...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deviceStates.map((device) => (
            <div
              key={device.device_id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-cyan-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getDeviceIcon(device.state)}
                  <div>
                    <div className="font-mono text-sm text-cyan-400">{device.device_id}</div>
                    <div className="text-xs text-gray-500">
                      Controller: {device.controller_id}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(device.last_update).toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    {device.event_count} updates
                  </div>
                </div>
              </div>
              <div className="font-mono text-sm bg-gray-900 px-3 py-2 rounded border border-gray-700">
                {formatState(device.state)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
