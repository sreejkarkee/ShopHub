import './Cart.css';
import { useState } from 'react';
import axios from '../../api/axios';

const isRemoteProduct = (item) => /^[a-f\d]{24}$/i.test(String(item?._id || ''));

export default function Cart({ cartItems = [], onRemove, onUpdateQuantity, onCheckout }) {
  const [message, setMessage] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0);

  const handleCheckout = async () => {
    if (checkingOut || !cartItems.length) return;
    setCheckingOut(true);
    setMessage('');

    try {
      const remoteItems = cartItems.filter(isRemoteProduct);
      if (remoteItems.length) {
        await axios.post('/orders', {
          items: remoteItems.map((item) => ({
            productId: item._id,
            quantity: Number(item.quantity) || 1,
          })),
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      }

      onCheckout();
      setMessage('Order placed successfully. Thank you for shopping thoughtfully.');
    } catch {
      setMessage('We could not place the order right now. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <main className="page-shell cart"><p className="eyebrow">Your selection</p><h1>Your cart</h1>
      {cartItems.length === 0 ? (
        <p className="cart-empty">Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item, i) => (
              <li key={i} className="cart-item">
                <div><strong>{item.name}</strong><small>{item.category || 'General'}</small></div>
                <div className="cart-item-controls">
                  <button type="button" onClick={() => onUpdateQuantity(i, Math.max(1, (Number(item.quantity) || 1) - 1))}>-</button>
                  <span>{Number(item.quantity) || 1}</span>
                  <button type="button" disabled={(Number(item.quantity) || 1) >= Math.max(1, Number(item.quantityAvailable || item.quantity) || 1)} onClick={() => onUpdateQuantity(i, (Number(item.quantity) || 1) + 1)}>+</button>
                </div>
                <span>Rs.{(Number(item.price) * Number(item.quantity || 1)).toFixed(2)}</span>
                <button onClick={() => onRemove(i)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="cart-summary"><span>Subtotal</span><strong>Rs.{total.toFixed(2)}</strong></div>
          <button className="cart-checkout-btn" onClick={handleCheckout} disabled={checkingOut}>{checkingOut ? 'Processing...' : 'Continue to checkout'} <span>→</span></button>
          {message && <p className="form-success">{message}</p>}
        </>
      )}
    </main>
  );
}