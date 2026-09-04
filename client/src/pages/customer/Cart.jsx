import { useState } from 'react';
import './Cart.css';

export default function Cart({ cartItems = [], onRemove }) {
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p className="cart-empty">Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item, i) => (
              <li key={i} className="cart-item">
                <span>{item.name}</span>
                <span>${item.price}</span>
                <button onClick={() => onRemove(i)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="cart-total">Total: ${total}</div>
          <button className="cart-checkout-btn">Checkout</button>
        </>
      )}
    </div>
  );
}