import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/customer/ProductList';
import Dashboard from './pages/retailer/Dashboard';
import AddProduct from './pages/retailer/AddProduct';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* customer side */}
          <Route
            path="/products"
            element={<PrivateRoute role="customer"><ProductList /></PrivateRoute>}
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}