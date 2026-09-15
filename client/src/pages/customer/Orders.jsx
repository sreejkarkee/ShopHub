import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import './Orders.css';

const STEPS = ['placed', 'shipped', 'out_for_delivery', 'delivered'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [unauthed, setUnauthed] = useState(false);

  useEffect(() => {
    axios
      .get('/orders/my-orders', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        if (!err.response) {
          setError('Cannot reach the server. Check your connection.');
        } else if (err.response.status === 401) {
          setUnauthed(true);
          setError('Your session has expired. Please sign in again.');
        } else {
          setError('Orders could not be loaded. Please try again.');
        }
      });
  }, []);

  return (
    <main className="page-shell orders-page">
      <p className="eyebrow">Track</p>
      <h1>Your orders</h1>
      {error && <p className="form-error">{error}</p>}
      {unauthed && <p><Link to="/login">Sign in →</Link></p>}
      {!error && !orders.length && <p className="orders-empty">No orders yet. Once you pay, they will show up here.</p>}
      <ul className="orders-list">
        {orders.map((o) => (
          <li key={o._id} className="order-card">
            <div className="order-head">
              <strong>Order …{o._id.slice(-6)}</strong>
              <span className={`pay-pill ${o.paymentStatus}`}>{o.paymentStatus === 'paid' ? 'Paid ✓' : 'Unpaid'}</span>
              <span className="order-total">Rs.{Number(o.total).toFixed(2)}</span>
            </div>
            {o.items.map((item) => {
              const idx = STEPS.indexOf(item.shipmentStatus);
              return (
                <div key={item._id} className="order-item">
                  <div className="order-item-top">
                    <strong>{item.productName}{Number(item.quantity) > 1 ? ` × ${item.quantity}` : ''}</strong>
                    <small>{item.shipmentStatus?.replace(/_/g, ' ')}</small>
                  </div>
                  <div className="track">
                    {STEPS.map((s, i) => (
                      <span key={s} className={`dot ${i <= idx ? 'on' : ''}`} title={s} />
                    ))}
                  </div>
                </div>
              );
            })}
          </li>
        ))}
      </ul>
    </main>
  );
}
