import { useState, useEffect } from 'react';

export function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const baseUrl = await (window as any).electronAPI.getServerUrl();
        const response = await fetch(`${baseUrl}/api/v1/events`);
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-zinc-100">Events</h1>

      {loading ? (
        <div className="text-zinc-400">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 p-8 text-center">
          <p className="text-zinc-400">No events recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border border-zinc-800 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-100">
                  {event.kind || 'Unknown Event'}
                </span>
                <span className="text-sm text-zinc-500">
                  {event.timestamp || 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
