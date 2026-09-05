import { useEffect, useState } from 'react';
import axios from '../../api/axios';

export default function Dashboard() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    axios
      .get('/orders/my-sales', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setSales(res.data))
      .catch(() => setSales([]));
  }, []);

  const total = sales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <main className="page-shell dashboard-page">
      <p className="eyebrow">Retailer studio</p>
      <h1>Your shop, at a glance.</h1>
      <section className="metric-strip"><div><span>Sales to date</span><strong>${total.toFixed(2)}</strong></div><div><span>Orders</span><strong>{sales.length}</strong></div><div><span>Status</span><strong className="status-dot">Live</strong></div></section>
      <div className="dashboard-heading"><div><p className="eyebrow">Activity</p><h2>Recent sales</h2></div><a href="/retailer/add-product">Add a product →</a></div>
      <ul className="sales-list">
        {sales.map((s) => (
          <li key={s._id}><div><strong>{s.productName}</strong><small>Order completed</small></div><b>${Number(s.amount).toFixed(2)}</b></li>
        ))}
        {!sales.length && <li className="sales-empty">Your first sale will appear here.</li>}
      </ul>
    </main>
  );
}