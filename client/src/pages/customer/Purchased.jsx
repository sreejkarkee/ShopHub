import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import MockBankPay from '../../components/MockBankPay';
import './Purchased.css';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function Purchased() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unauthed, setUnauthed] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    axios.get('/orders/my-orders', { headers: authHeaders() })
      .then(({ data }) => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!err.response) {
          setError('Cannot reach the server. Check your connection and that the API is running.');
        } else if (err.response.status === 401) {
          setUnauthed(true);
          setError('Your session has expired. Please sign in again.');
        } else {
          setError('Your purchases could not be loaded. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePayNow = async (orderId, { bank, accountNo }) => {
    setPayBusy(true);
    setPayError('');
    try {
      const { data: paid } = await axios.post(
        `/orders/${orderId}/pay`,
        { bank, accountNo },
        { headers: authHeaders() }
      );
      setOrders((prev) => prev.map((o) => (o._id === orderId ? paid : o)));
      setPayingOrderId(null);
    } catch (err) {
      setPayError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPayBusy(false);
    }
  };

  return (
    <main className="page-shell purchased-page">
      <p className="eyebrow">Your history</p>
      <h1>Purchased</h1>
      {loading && <p className="purchased-state">Loading your purchases...</p>}
      {error && <p className="form-error">{error}</p>}
      {unauthed && !loading && <p><Link to="/login">Sign in →</Link></p>}
      {!loading && !error && !orders.length && (
        <p className="purchased-state">Products you purchase will appear here.</p>
      )}
      <div className="purchase-list">
        {orders.map((order) => (
          <article className="purchase-order" key={order._id}>
            <header>
              <div><span>Order placed</span><strong>{new Date(order.createdAt).toLocaleDateString()}</strong></div>
              <div><span>Status</span><strong className="purchase-status">{String(order.status).replace(/_/g, ' ')}</strong></div>
              <div>
                <span>Payment</span>
                <strong className={`purchase-pay ${order.paymentStatus}`}>
                  {order.paymentStatus === 'paid' ? 'Paid ✓' : 'Unpaid'}
                </strong>
              </div>
              <strong>Rs.{Number(order.total).toFixed(2)}</strong>
            </header>
            <ul>
              {order.items.map((item) => (
                <li key={item._id || item.product}>
                  <span>
                    {item.productName}
                    {Number(item.quantity) > 1 ? ` × ${item.quantity}` : ''}
                    <small> · {String(item.shipmentStatus || 'placed').replace(/_/g, ' ')}</small>
                  </span>
                  <strong>Rs.{(Number(item.amount) * Number(item.quantity || 1)).toFixed(2)}</strong>
                </li>
              ))}
            </ul>
            {order.paymentStatus !== 'paid' && (
              <div className="purchase-paynow">
                {payingOrderId === order._id ? (
                  <>
                    <MockBankPay
                      amount={order.total}
                      busyLabel={payBusy ? 'Processing bank transfer…' : null}
                      error={payError}
                      onPay={(details) => handlePayNow(order._id, details)}
                    />
                    {!payBusy && (
                      <button className="purchase-cancel" onClick={() => setPayingOrderId(null)}>Cancel</button>
                    )}
                  </>
                ) : (
                  <button className="purchase-paybtn" onClick={() => { setPayingOrderId(order._id); setPayError(''); }}>
                    Complete payment →
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
