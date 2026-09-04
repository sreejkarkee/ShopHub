import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">ShopHub</Link>

      <div className="navbar-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {user?.role === 'customer' && (
          <>
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart</Link>
          </>
        )}

        {user?.role === 'retailer' && (
          <>
            <Link to="/retailer/dashboard">Dashboard</Link>
            <Link to="/retailer/add-product">Add Product</Link>
          </>
        )}

        {user && (
          <button className="navbar-logout" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}