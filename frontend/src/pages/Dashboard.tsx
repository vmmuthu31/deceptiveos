import { useEffect, useState } from 'react';

export function Dashboard() {
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('offline');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const baseUrl = await (window as any).electronAPI.getServerUrl();
        const response = await fetch(`${baseUrl}/health`);
        setServerStatus(response.ok ? 'online' : 'offline');

        if (response.ok) {
          const statusRes = await fetch(`${baseUrl}/api/v1/status`);
          const data = await statusRes.json();
          setStats(data);
        }
      } catch {
        setServerStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-100">CipherNest Dashboard</h1>
        <div
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            serverStatus === 'online'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          Server: {serverStatus}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Honeypots Running"
            value={stats.honeypots?.running || 0}
            total={stats.honeypots?.total || 0}
            color="emerald"
          />
          <StatCard
            title="Events Today"
            value={stats.events?.total_today || 0}
            total={stats.events?.total_today || 0}
            color="blue"
          />
          <StatCard
            title="Alerts Today"
            value={stats.events?.alerts_today || 0}
            total={stats.events?.alerts_today || 0}
            color="amber"
          />
          <StatCard
            title="AI Engine"
            value={stats.ai_engine?.status || 'idle'}
            total=""
            color="purple"
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  total,
  color,
}: {
  title: string;
  value: string | number;
  total: string | number;
  color: 'emerald' | 'blue' | 'amber' | 'purple' | 'red';
}) {
  const colorClasses = {
    emerald: 'border-emerald-500/30 bg-emerald-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    amber: 'border-amber-500/30 bg-amber-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
    red: 'border-red-500/30 bg-red-500/5',
  };

  return (
    <div
      className={`rounded-lg border ${colorClasses[color]} p-4`}
    >
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-100">{value}</p>
      {total !== '' && total !== value && (
        <p className="text-xs text-zinc-500">of {total} total</p>
      )}
    </div>
  );
}
