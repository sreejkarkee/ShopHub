import { useEffect, useState } from 'react';
import axios from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios
      .get('/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  return (
    <main className="page-shell dashboard-page">
      <p className="eyebrow">ShopHub operations</p><h1>Keep the marketplace moving.</h1>
      <section className="metric-strip"><div><span>Total sales</span><strong>${stats?.totalSales || '—'}</strong></div><div><span>Access</span><strong>Admin</strong></div><div><span>System</span><strong className="status-dot">Online</strong></div></section>
      {!stats && <p className="form-hint">Live metrics will appear when the admin service is connected.</p>}
    </main>
  );
}