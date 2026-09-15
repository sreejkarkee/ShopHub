import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const cartCount = () => {
  try {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    return items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0);
  } catch {
    return 0;
  }
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [count, setCount] = useState(cartCount);

  useEffect(() => {
    const update = () => setCount(cartCount());
    update();
    window.addEventListener('cart-updated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('cart-updated', update);
      window.removeEventListener('storage', update);
    };
  }, [location.pathname]);

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

        {(user?.role === 'customer' || user?.role === 'retailer' || user?.role === 'admin') && (
          <>
            <Link className={location.pathname === '/products' ? 'active' : ''} to="/products">Discover</Link>
            {user.role === 'customer' && (
              <>
                <Link className={location.pathname === '/cart' ? 'active' : ''} to="/cart">
                  Cart{count > 0 && <span className="cart-badge">{count}</span>}
                </Link>
                <Link className={location.pathname === '/purchased' ? 'active' : ''} to="/purchased">Purchased</Link>
                <Link className={location.pathname === '/orders' ? 'active' : ''} to="/orders">Orders</Link>
              </>
            )}
          </>
        )}

        {user?.role === 'retailer' && (
          <>
            <Link className={location.pathname === '/retailer/dashboard' ? 'active' : ''} to="/retailer/dashboard">Overview</Link>
            <Link className={location.pathname === '/retailer/add-product' ? 'active' : ''} to="/retailer/add-product">Add product</Link>
          </>
        )}

        {user?.role === 'admin' && (
          <Link className={location.pathname === '/admin/dashboard' ? 'active' : ''} to="/admin/dashboard">Admin dashboard</Link>
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
