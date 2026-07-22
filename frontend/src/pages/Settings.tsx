import { useState, useEffect } from 'react';

export function Settings() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const baseUrl = await (window as any).electronAPI.getServerUrl();
        const response = await fetch(`${baseUrl}/api/v1/status`);
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('Failed to fetch config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-zinc-100">Settings</h1>

      {loading ? (
        <div className="text-zinc-400">Loading settings...</div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-800 p-4">
            <h2 className="mb-3 text-lg font-medium text-zinc-200">
              Server Configuration
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Status</span>
                <span className="text-zinc-200">
                  {config?.server?.status || 'unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">AI Engine</span>
                <span className="text-zinc-200">
                  {config?.ai_engine?.status || 'unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">AI Model</span>
                <span className="text-zinc-200">
                  {config?.ai_engine?.model || 'not configured'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 p-4">
            <h2 className="mb-3 text-lg font-medium text-zinc-200">
              Compliance
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">SOC 2</span>
                <span className="text-zinc-200">Not configured</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">ISO 27001</span>
                <span className="text-zinc-200">Not configured</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">GDPR</span>
                <span className="text-zinc-200">Not configured</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
