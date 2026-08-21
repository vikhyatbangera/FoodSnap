import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { user } = useAuth();
  const links = user?.role === 'partner'
    ? [{ to: '/partner', label: 'Home', icon: '⌂' }, { to: '/partner/foods', label: 'Menu', icon: '✦' }, { to: '/partner/orders', label: 'Orders', icon: '▣' }, { to: '/partner/profile', label: 'Profile', icon: '●' }]
    : [{ to: '/', label: 'Discover', icon: '⌂' }, { to: '/explore', label: 'Explore', icon: '⌕' }, { to: '/reels', label: 'Reels', icon: '▶' }, { to: '/cart', label: 'Cart', icon: '▱' }];
  return <nav className="bottom-nav">{links.map((link) => <NavLink key={link.to} to={link.to}><span>{link.icon}</span>{link.label}</NavLink>)}</nav>;
}
