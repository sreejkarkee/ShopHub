import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/customer/ProductList';
import Cart from './pages/customer/Cart';
import Dashboard from './pages/retailer/Dashboard';
import AddProduct from './pages/retailer/AddProduct';
import AdminDashboard from './pages/admin/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* customer side */}
          <Route
            path="/products"
            element={<PrivateRoute role="customer"><ProductList /></PrivateRoute>}
          />
          <Route
            path="/cart"
            element={<PrivateRoute role="customer"><Cart /></PrivateRoute>}
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