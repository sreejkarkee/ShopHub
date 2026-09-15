import './Cart.css';
import { useState } from 'react';
import axios from '../../api/axios';
import MockBankPay from '../../components/MockBankPay';

const isRemoteProduct = (item) => /^[a-f\d]{24}$/i.test(String(item?._id || ''));
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function Cart({ cartItems = [], onRemove, onUpdateQuantity, onCheckout }) {
  const [phase, setPhase] = useState('idle'); // idle | creating | paying | success | error
  const [error, setError] = useState('');
  const [paidOrder, setPaidOrder] = useState(null);
  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0);

  const handlePay = async ({ bank, accountNo }) => {
    if (!cartItems.length || phase === 'creating' || phase === 'paying') return;
    setError('');
    try {
      setPhase('creating');
      const remoteItems = cartItems.filter(isRemoteProduct);
      const { data: order } = await axios.post(
        '/orders',
        remoteItems.length
          ? {
              items: remoteItems.map((item) => ({
                productId: item._id,
                quantity: Number(item.quantity) || 1,
              })),
            }
          : { productIds: cartItems.map((item) => item._id) },
        { headers: authHeaders() }
      );
      setPhase('paying');
      // Mock bank transfer: short simulated delay on the server, then marked paid.
      const { data: paid } = await axios.post(
        `/orders/${order._id}/pay`,
        { bank, accountNo },
        { headers: authHeaders() }
      );
      setPaidOrder(paid);
      setPhase('success');
      onCheckout();
    } catch (err) {
      setPhase('error');
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  const busyLabel = phase === 'creating' ? 'Creating order…' : phase === 'paying' ? 'Processing bank transfer…' : null;

  const isBusy = phase === 'creating' || phase === 'paying';

  return (
    <main className="page-shell cart">
      <p className="eyebrow">Your selection</p>
      <h1>Your cart</h1>

      <div className="cart-steps" aria-label="Checkout progress">
        <span className="cart-step done">1 · Cart</span>
        <span className="cart-step-sep">—</span>
        <span className={`cart-step ${phase === 'success' ? 'done' : 'current'}`}>2 · Payment</span>
        <span className="cart-step-sep">—</span>
        <span className={`cart-step ${phase === 'success' ? 'current' : ''}`}>3 · Done</span>
      </div>

      {cartItems.length === 0 && phase !== 'success' ? (
        <p className="cart-empty">Your cart is empty.</p>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-card">
            <h2>Items ({phase === 'success' ? 0 : cartItems.length})</h2>
            {phase === 'success' ? (
              <div className="cart-success-inline">
                <span className="pay-check">✓</span>
                <div>
                  <strong>Payment successful</strong>
                  <small>Order {paidOrder?._id?.slice(-6)} · Rs.{Number(paidOrder?.total || 0).toFixed(2)} paid</small>
                </div>
              </div>
            ) : (
              <ul className="cart-list">
                {cartItems.map((item, i) => (
                  <li key={i} className="cart-item">
                    <div><strong>{item.name}</strong><small>{item.category || 'General'}</small></div>
                    <div className="cart-item-controls">
                      <button type="button" disabled={isBusy} onClick={() => onUpdateQuantity(i, Math.max(1, (Number(item.quantity) || 1) - 1))}>-</button>
                      <span>{Number(item.quantity) || 1}</span>
                      <button type="button" disabled={isBusy || (Number(item.quantity) || 1) >= Math.max(1, Number(item.quantityAvailable || item.quantity) || 1)} onClick={() => onUpdateQuantity(i, (Number(item.quantity) || 1) + 1)}>+</button>
                    </div>
                    <span className="cart-price">Rs.{(Number(item.price) * Number(item.quantity || 1)).toFixed(2)}</span>
                    <button onClick={() => onRemove(i)} disabled={isBusy}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="pay-card" aria-label="Payment">
            <div className="pay-card-head">
              <h2>Payment</h2>
              <span className="pay-secure">🔒 Secure</span>
            </div>

            <dl className="pay-summary">
              <div><dt>Items</dt><dd>{phase === 'success' ? 0 : cartItems.length}</dd></div>
              <div><dt>Subtotal</dt><dd>Rs.{total.toFixed(2)}</dd></div>
              <div><dt>Delivery</dt><dd className="free">Free</dd></div>
              <div className="pay-total"><dt>Total to pay</dt><dd>Rs.{total.toFixed(2)}</dd></div>
            </dl>

            {phase === 'success' ? (
              <div className="pay-done">
                <p className="form-success">Paid successfully. Thank you for shopping thoughtfully.</p>
                <a className="pay-secondary" href="/products">Continue shopping →</a>
              </div>
            ) : (
              <>
                <MockBankPay
                  amount={total}
                  busyLabel={busyLabel}
                  error={error}
                  onPay={handlePay}
                />
                {phase === 'error' && (
                  <p className="pay-note">Fix the issue above, then submit the form again to retry.</p>
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
