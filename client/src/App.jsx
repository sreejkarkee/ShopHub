import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/customer/ProductList';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Purchased from './pages/customer/Purchased';
import Orders from './pages/customer/Orders';
import Dashboard from './pages/retailer/Dashboard';
import AddProduct from './pages/retailer/AddProduct';
import AdminDashboard from './pages/admin/Dashboard';

export default function App() {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  // Keep the navbar cart badge in sync with cart changes.
  useEffect(() => {
    window.dispatchEvent(new Event('cart-updated'));
  }, [cartItems]);

  useEffect(() => {
    if (!toast) return;
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(toastTimer.current);
  }, [toast]);

  const addToCart = (product, quantity = 1) => {
    const nextQuantity = Math.max(1, Number(quantity) || 1);
    const availableQuantity = Math.max(1, Number(product.quantity) || 1);
    setCartItems((items) => {
      const normalized = items.map((item) => ({ ...item, quantity: Math.max(1, Number(item.quantity) || 1) }));
      const existingIndex = normalized.findIndex((item) => String(item._id) === String(product._id));
      const next = [...normalized];

      if (existingIndex >= 0) {
        const currentQuantity = next[existingIndex].quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantityAvailable: availableQuantity,
          quantity: Math.min(availableQuantity, currentQuantity + nextQuantity),
        };
      } else {
        next.push({ ...product, quantityAvailable: availableQuantity, quantity: Math.min(availableQuantity, nextQuantity) });
      }

      const validItems = next.filter((item) => Number(item.quantity) > 0);
      localStorage.setItem('cart', JSON.stringify(validItems));
      setToast(`Added ${product.name} × ${nextQuantity} to cart`);
      return validItems;
    });
  };

  const updateCartQuantity = (index, quantity) => {
    setCartItems((items) => {
      const next = [...items];
      const nextQuantity = Math.max(1, Number(quantity) || 1);
      const availableQuantity = Math.max(1, Number(next[index]?.quantityAvailable) || Number(next[index]?.quantity) || 1);
      next[index] = { ...next[index], quantity: Math.min(availableQuantity, nextQuantity) };
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  };

  const removeFromCart = (index) => {
    setCartItems((items) => {
      const next = items.filter((_, itemIndex) => itemIndex !== index);
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  };

  const clearCart = () => {
    localStorage.removeItem('cart');
    setCartItems([]);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        {toast && (
          <div className="cart-toast" role="status">
            <span>{toast}</span>
            <Link to="/cart">View cart →</Link>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* customer side */}
          <Route
            path="/products"
            element={<PrivateRoute roles={["customer", "retailer", "admin"]}><ProductList onAddToCart={addToCart} isInCart={(id) => cartItems.some((item) => String(item._id) === String(id))} /></PrivateRoute>}
          />
          <Route
            path="/products/:productId"
            element={<PrivateRoute roles={["customer", "retailer", "admin"]}><ProductDetail onAddToCart={addToCart} isInCart={(id) => cartItems.some((item) => String(item._id) === String(id))} /></PrivateRoute>}
          />
          <Route
            path="/cart"
            element={<PrivateRoute role="customer"><Cart cartItems={cartItems} onRemove={removeFromCart} onUpdateQuantity={updateCartQuantity} onCheckout={clearCart} /></PrivateRoute>}
          />
          <Route
            path="/purchased"
            element={<PrivateRoute role="customer"><Purchased /></PrivateRoute>}
          />
          <Route
            path="/orders"
            element={<PrivateRoute role="customer"><Orders /></PrivateRoute>}
          />

          {/* retailer side */}
          <Route
            path="/retailer/dashboard"
            element={<PrivateRoute role="retailer"><Dashboard /></PrivateRoute>}
          />
          <Route
            path="/retailer/add-product"
            element={<PrivateRoute role="retailer"><AddProduct /></PrivateRoute>}
          />

          {/* admin side */}
          <Route
            path="/admin/dashboard"
            element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
