import { Link, NavLink, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const customerLinks = [{ to: '/', label: 'Discover' }, { to: '/reels', label: 'Reels' }, { to: '/orders', label: 'Orders' }, { to: '/saved', label: 'Saved' }];
  const partnerLinks = [{ to: '/partner', label: 'Dashboard' }, { to: '/partner/foods', label: 'Menu' }, { to: '/partner/reels/new', label: 'Create reel' }, { to: '/partner/orders', label: 'Orders' }];
  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link to={user?.role === 'partner' ? '/partner' : '/'} className="brand"><span className="brand-mark">✦</span><span>Food<span>Snap</span></span></Link>
        <div className="nav-search"><SearchBar compact /></div>
        {user && <nav className="desktop-links">{(user.role === 'partner' ? partnerLinks : customerLinks).map((link) => <NavLink key={link.to} to={link.to} end={link.to === '/' || link.to === '/partner'}>{link.label}</NavLink>)}</nav>}
        <div className="nav-actions">
          {user?.role === 'customer' && <Link className="cart-link" to="/cart" aria-label={`Cart with ${itemCount} items`}>▱<sup>{itemCount}</sup></Link>}
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? '☾' : '☀'}</button>
          {user ? <button className="avatar-button" onClick={() => navigate(user.role === 'partner' ? '/partner/profile' : '/profile')} aria-label="Open profile">{user.name?.charAt(0).toUpperCase()}</button> : <Link className="button button-small button-dark" to="/login">Sign in</Link>}
          {user && <button className="button button-small button-ghost logout-button" onClick={logout}>Log out</button>}
        </div>
      </div>
    </header>
  );
}
