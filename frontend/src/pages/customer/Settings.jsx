import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as usersApi from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ImageUploadField from '../../components/ImageUploadField';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [photo, setPhoto] = useState(null);
  const [notifications, setNotifications] = useState(user?.settings?.notifications !== false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function saveProfile(event) {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    try { const formData = new FormData(); formData.append('name', name); if (photo) formData.append('photo', photo); const result = await usersApi.updateMe(formData); updateUser(result.user); setMessage('Profile saved.'); } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Could not save your profile.'); } finally { setSaving(false); }
  }
  async function setNotification(value) {
    setNotifications(value);
    try { const result = await usersApi.updateSettings({ notifications: value }); updateUser(result.user); } catch { setError('Notification preference could not be synced.'); }
  }
  return <div className="settings-page"><div className="page-heading"><div><span className="eyebrow">Make it yours</span><h1>Settings.</h1><p>Your account, your atmosphere.</p></div></div>{message && <div className="success-message">{message}</div>}{error && <div className="form-error">{error}</div>}<form className="panel settings-card form-stack" onSubmit={saveProfile}><h3>Profile details</h3><label>Name<input value={name} onChange={(event) => setName(event.target.value)} /></label><ImageUploadField label="Profile photo" onChange={setPhoto} /><button className="button button-accent" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button></form><section className="panel settings-card"><h3>Preferences</h3><div className="setting-row"><div><strong>Appearance</strong><small>Use a softer dark palette at night.</small></div><button className="theme-choice" onClick={toggleTheme}>{theme === 'light' ? '☀ Light' : '☾ Dark'}</button></div><div className="setting-row"><div><strong>Notifications</strong><small>Updates about orders and new kitchens.</small></div><button className={`switch ${notifications ? 'on' : ''}`} onClick={() => setNotification(!notifications)} aria-label="Toggle notifications"><span /></button></div></section><button className="button button-ghost" onClick={() => { logout(); navigate('/login'); }}>Log out</button></div>;
}
