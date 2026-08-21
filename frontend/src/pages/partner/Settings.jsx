import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as usersApi from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function PartnerSettings() {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(user.settings?.notifications !== false);
  const [message, setMessage] = useState('');
  async function updateNotifications() { const next = !notifications; setNotifications(next); try { const result = await usersApi.updateSettings({ notifications: next }); updateUser(result.user); setMessage('Notification preference saved.'); } catch (error) { void error; setNotifications(!next); setMessage('Could not save that preference.'); } }
  return <div className="content-page settings-page"><div className="page-heading"><div><span className="eyebrow">Make it yours</span><h1>Kitchen settings.</h1><p>Your account, your atmosphere.</p></div></div><section className="panel settings-panel"><div className="settings-row"><div><strong>Appearance</strong><small>Use a softer dark palette at night.</small></div><button className="button button-ghost" onClick={toggleTheme}>{theme === 'light' ? '☾ Dark' : '☀ Light'}</button></div><div className="settings-row"><div><strong>Notifications</strong><small>Updates about orders and new kitchens.</small></div><button className={notifications ? 'toggle on' : 'toggle'} onClick={updateNotifications} aria-label="Toggle notifications" aria-pressed={notifications}><span /></button></div>{message && <div className="success-message">{message}</div>}</section><button className="button button-ghost" onClick={() => { logout(); navigate('/login'); }}>Log out</button></div>;
}
