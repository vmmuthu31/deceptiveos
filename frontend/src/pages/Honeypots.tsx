import { useState, useEffect } from 'react';

export function Honeypots() {
  const [honeypots, setHoneypots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHoneypots = async () => {
      try {
        const baseUrl = await (window as any).electronAPI.getServerUrl();
        const response = await fetch(`${baseUrl}/api/v1/honeypots`);
        const data = await response.json();
        setHoneypots(data.honeypots || []);
      } catch (error) {
        console.error('Failed to fetch honeypots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHoneypots();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-100">Honeypots</h1>
        <button
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          onClick={async () => {
            const baseUrl = await (window as any).electronAPI.getServerUrl();
            await fetch(`${baseUrl}/api/v1/honeypots`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: 'New Honeypot', type: 'cowrie-ssh' }),
            });
            window.location.reload();
          }}
        >
          Deploy Honeypot
        </button>
      </div>

      {loading ? (
        <div className="text-zinc-400">Loading honeypots...</div>
      ) : honeypots.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 p-8 text-center">
          <p className="text-zinc-400">No honeypots deployed yet.</p>
          <p className="mt-2 text-sm text-zinc-500">
            Click "Deploy Honeypot" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {honeypots.map((hp) => (
            <div
              key={hp.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800 p-4"
            >
              <div>
                <h3 className="font-medium text-zinc-100">{hp.name}</h3>
                <p className="text-sm text-zinc-500">{hp.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    hp.status === 'running'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-500/20 text-zinc-400'
                  }`}
                >
                  {hp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
