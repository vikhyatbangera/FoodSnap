import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const initialForm = { name: '', email: '', password: '', role: 'customer', businessName: '', cuisines: '' };

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (user) return <Navigate to={user.role === 'partner' ? '/partner' : '/'} replace />;
  function change(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }
  async function submit(event) {
    event.preventDefault();
    setError('');
    if (form.name.trim().length < 2) return setError('Tell us your name.');
    if (form.password.length < 8) return setError('Use at least 8 characters for your password.');
    if (form.role === 'partner' && form.businessName.trim().length < 2) return setError('Add your business name to continue.');
    setSubmitting(true);
    try {
      const created = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.role === 'partner' ? { business: { name: form.businessName, cuisines: form.cuisines.split(',').map((item) => item.trim()).filter(Boolean) } } : {})
      });
      navigate(created.role === 'partner' ? '/partner' : '/', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'We could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className="auth-page register-page">
      <section className="auth-panel">
        <Link to="/" className="brand auth-brand"><span className="brand-mark">✦</span><span>Food<span>Snap</span></span></Link>
        <span className="eyebrow">Join the table</span>
        <h1>Make every meal<br />a little more <em>you.</em></h1>
        <p className="auth-subtitle">Follow cravings, support local kitchens, and collect moments worth sharing.</p>
        <div className="role-toggle" role="group" aria-label="Account type">
          <button className={form.role === 'customer' ? 'active' : ''} onClick={() => change('role', 'customer')} type="button">I’m discovering</button>
          <button className={form.role === 'partner' ? 'active' : ''} onClick={() => change('role', 'partner')} type="button">I’m a food partner</button>
        </div>
        <form className="form-stack" onSubmit={submit}>
          {error && <div className="form-error" role="alert">{error}</div>}
          <label>Your name<input required value={form.name} onChange={(event) => change('name', event.target.value)} placeholder="Maya Chen" autoComplete="name" /></label>
          <label>Email address<input required type="email" value={form.email} onChange={(event) => change('email', event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
          <label>Password<input required type="password" minLength="8" value={form.password} onChange={(event) => change('password', event.target.value)} placeholder="At least 8 characters" autoComplete="new-password" /></label>
          {form.role === 'partner' && <><label>Business name<input required value={form.businessName} onChange={(event) => change('businessName', event.target.value)} placeholder="Your kitchen or café" /></label><label>Cuisines <span className="label-hint">optional, comma separated</span><input value={form.cuisines} onChange={(event) => change('cuisines', event.target.value)} placeholder="Italian, brunch" /></label></>}
          <button className="button button-accent button-wide" disabled={submitting}>{submitting ? 'Creating your account…' : 'Create account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </section>
      <div className="auth-side-copy"><span className="auth-food-art">🥢</span><p>Good food is<br /><em>always</em> worth finding.</p></div>
    </main>
  );
}
