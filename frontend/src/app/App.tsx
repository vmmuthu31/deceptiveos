import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Honeypots } from '../pages/Honeypots';
import { Events } from '../pages/Events';
import { Alerts } from '../pages/Alerts';
import { Settings } from '../pages/Settings';
import { Layout } from '../components/Layout';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/honeypots" element={<Honeypots />} />
        <Route path="/events" element={<Events />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}
