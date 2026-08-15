import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

export function Layout({ children }: { children: ReactNode }) {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '◭' },
    { path: '/honeypots', label: 'Honeypots', icon: '⧉' },
    { path: '/events', label: 'Events', icon: '○' },
    { path: '/alerts', label: 'Alerts', icon: '▲' },
    { path: '/settings', label: 'Settings', icon: '≡' },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <nav className="w-64 border-r border-zinc-800">
        <div className="p-4">
          <h1 className="text-xl font-bold text-zinc-100">CipherNest</h1>
          <p className="text-xs text-zinc-500">Cyber Deception Framework</p>
        </div>
        <ul className="space-y-1 p-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`
                }
              >
                <span className="w-5 text-center">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
