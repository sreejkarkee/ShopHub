import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import './Purchased.css';

export default function Purchased() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/orders/my-orders', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(({ data }) => {
      setOrders(Array.isArray(data) ? data : []);
    }).catch(() => {
      setError('Your purchases could not be loaded.');
    }).finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-shell purchased-page">
      <p className="eyebrow">Your history</p>
      <h1>Purchased</h1>
      {loading && <p className="purchased-state">Loading your purchases...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && !orders.length && (
        <p className="purchased-state">Products you purchase will appear here.</p>
      )}
      <div className="purchase-list">
        {orders.map((order) => (
          <article className="purchase-order" key={order._id}>
            <header>
              <div><span>Order placed</span><strong>{new Date(order.createdAt).toLocaleDateString()}</strong></div>
              <div><span>Status</span><strong className="purchase-status">{order.status}</strong></div>
              <strong>${Number(order.total).toFixed(2)}</strong>
            </header>
            <ul>
              {order.items.map((item) => (
                <li key={item._id || item.product}>
                  <span>{item.productName}</span>
                  <strong>${Number(item.amount).toFixed(2)}</strong>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}