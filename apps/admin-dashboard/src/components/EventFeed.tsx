import type { DomainEvent } from '../types/events';
import { Activity, Bell, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface EventFeedProps {
  events: DomainEvent[];
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  device_state_changed: <Zap className="w-4 h-4" />,
  controller_heartbeat: <Activity className="w-4 h-4" />,
  puzzle_solved: <CheckCircle2 className="w-4 h-4" />,
  emergency_stop_triggered: <AlertTriangle className="w-4 h-4" />,
  default: <Bell className="w-4 h-4" />,
};

const EVENT_COLORS: Record<string, string> = {
  device_state_changed: 'text-cyan-400',
  controller_heartbeat: 'text-gray-500',
  puzzle_solved: 'text-green-400',
  scene_advanced: 'text-purple-400',
  emergency_stop_triggered: 'text-red-400',
  default: 'text-gray-400',
};

export function EventFeed({ events }: EventFeedProps) {
  const formatEventType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatPayload = (payload: any) => {
    if (!payload) return null;

    // Handle device state changes
    if (payload.new_state) {
      return Object.entries(payload.new_state)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }

    // Handle other payloads
    if (typeof payload === 'object') {
      return JSON.stringify(payload, null, 2);
    }

    return String(payload);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 h-[calc(100vh-200px)] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyan-400" />
        Live Event Feed
        <span className="ml-auto text-sm text-gray-400">{events.length} events</span>
      </h2>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
            <p>Waiting for events...</p>
            <p className="text-sm mt-1">Events will appear here in real-time</p>
          </div>
        ) : (
          events.map((event, index) => {
            const icon = EVENT_ICONS[event.type] || EVENT_ICONS.default;
            const color = EVENT_COLORS[event.type] || EVENT_COLORS.default;

            return (
              <div
                key={`${event.event_id}-${index}`}
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-cyan-600 transition-all animate-fadeIn"
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 ${color}`}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-semibold text-sm">{formatEventType(event.type)}</div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    {event.device_id && (
                      <div className="text-xs text-gray-400 font-mono mb-1">
                        {event.device_id}
                      </div>
                    )}

                    {event.payload && (
                      <div className="text-xs bg-gray-900 rounded px-2 py-1 mt-1 font-mono text-gray-300 overflow-x-auto">
                        {formatPayload(event.payload)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
