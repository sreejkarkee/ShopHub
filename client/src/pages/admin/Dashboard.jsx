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
    <div>
      <h2>Admin Dashboard</h2>
      {stats ? (
        <p>Total sales: ${stats.totalSales}</p>
      ) : (
        <p>Loading or unauthorized.</p>
      )}
    </div>
  );
}