import './Cart.css';
import { useState } from 'react';
import axios from '../../api/axios';

export default function Cart({ cartItems = [], onRemove, onCheckout }) {
  const [message, setMessage] = useState('');
  const total = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  const handleCheckout = async () => {
    try {
      await axios.post('/orders', { productIds: cartItems.map((item) => item._id) }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      onCheckout();
      setMessage('Order placed successfully. Thank you for shopping thoughtfully.');
    } catch {
      setMessage('Checkout is unavailable for these local demo products.');
    }
  };

  return (
    <main className="page-shell cart"><p className="eyebrow">Your selection</p><h1>Your bag</h1>
      {cartItems.length === 0 ? (
        <p className="cart-empty">Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item, i) => (
              <li key={i} className="cart-item">
                <div><strong>{item.name}</strong><small>{item.category || 'ShopHub edit'}</small></div><span>${Number(item.price).toFixed(2)}</span>
                <button onClick={() => onRemove(i)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="cart-summary"><span>Subtotal</span><strong>${total.toFixed(2)}</strong></div>
          <button className="cart-checkout-btn" onClick={handleCheckout}>Continue to checkout <span>→</span></button>
          {message && <p className="form-success">{message}</p>}
        </>
      )}
    </main>
  );
}