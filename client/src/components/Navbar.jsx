import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to={user?.role === 'retailer' ? '/retailer/dashboard' : '/products'} className="navbar-brand">
        <span className="brand-mark">S</span>ShopHub
      </Link>

      <div className="navbar-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {user?.role === 'customer' && (
          <>
            <Link className={location.pathname === '/products' ? 'active' : ''} to="/products">Discover</Link>
            <Link className={location.pathname === '/cart' ? 'active' : ''} to="/cart">Cart</Link>
          </>
        )}

        {user?.role === 'retailer' && (
          <>
            <Link className={location.pathname === '/retailer/dashboard' ? 'active' : ''} to="/retailer/dashboard">Overview</Link>
            <Link className={location.pathname === '/retailer/add-product' ? 'active' : ''} to="/retailer/add-product">Add product</Link>
          </>
        )}

        {user && (
          <button className="navbar-logout" onClick={handleLogout}>
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}