import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (user) return <Navigate to={user.role === 'partner' ? '/partner' : '/'} replace />;
  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Enter your email and password.');
    setSubmitting(true);
    try {
      const loggedIn = await login(form);
      const destination = location.state?.from?.pathname || (loggedIn.role === 'partner' ? '/partner' : '/');
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'We could not sign you in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-art"><span className="auth-orbit orbit-one" /><span className="auth-orbit orbit-two" /><span className="auth-food-art">🍜</span><span className="auth-note note-one">made with feeling</span><span className="auth-note note-two">find your flavour</span></div>
      <section className="auth-panel">
        <Link to="/" className="brand auth-brand"><span className="brand-mark">✦</span><span>Food<span>Snap</span></span></Link>
        <span className="eyebrow">Welcome back</span>
        <h1>Your next favourite<br />is waiting.</h1>
        <p className="auth-subtitle">Sign in to keep your cravings, saves, and orders in one place.</p>
        <form className="form-stack" onSubmit={submit}>
          {error && <div className="form-error" role="alert">{error}</div>}
          <label>Email<input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
          <label>Password<input type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Your password" /></label>
          <div className="demo-accounts" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '0.5rem 0' }}>
            <button type="button" className="button" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={() => setForm({ email: 'maya@example.com', password: 'Password123!' })}>Demo Customer</button>
            <button type="button" className="button" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={() => setForm({ email: 'spice@example.com', password: 'Password123!' })}>Demo Partner</button>
          </div>
          <button className="button button-accent button-wide" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="auth-switch">New to FoodSnap? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  );
}
