import { useState, useEffect } from 'react';

export function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const baseUrl = await (window as any).electronAPI.getServerUrl();
        const response = await fetch(`${baseUrl}/api/v1/alerts`);
        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-zinc-100">Alerts</h1>

      {loading ? (
        <div className="text-zinc-400">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 p-8 text-center">
          <p className="text-zinc-400">No alerts yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-amber-400">
                  {alert.title || 'Alert'}
                </span>
                <span className="text-sm text-zinc-500">
                  {alert.timestamp || 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
