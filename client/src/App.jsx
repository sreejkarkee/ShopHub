import { useState } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/customer/ProductList';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Purchased from './pages/customer/Purchased';
import Dashboard from './pages/retailer/Dashboard';
import AddProduct from './pages/retailer/AddProduct';
import AdminDashboard from './pages/admin/Dashboard';

export default function App() {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const addToCart = (product) => {
    setCartItems((items) => {
      if (items.some((item) => String(item._id) === String(product._id))) return items;
      const next = [...items, product];
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
            element={<PrivateRoute role="customer"><Cart cartItems={cartItems} onRemove={removeFromCart} onCheckout={clearCart} /></PrivateRoute>}
          />
          <Route
            path="/purchased"
            element={<PrivateRoute role="customer"><Purchased /></PrivateRoute>}
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