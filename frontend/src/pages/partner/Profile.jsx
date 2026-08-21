import { useEffect, useState } from 'react';
import * as partnersApi from '../../api/partners';
import { useAuth } from '../../context/AuthContext';
import ImageUploadField from '../../components/ImageUploadField';
import Loader from '../../components/Loader';

export default function PartnerProfile() {
  const { user, updateUser } = useAuth();
  const business = user.business || {};
  const [form, setForm] = useState({ name: business.name || '', description: business.description || '', address: business.address || '', phone: business.phone || '', cuisines: (business.cuisines || []).join(', ') });
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { setForm({ name: user.business?.name || '', description: user.business?.description || '', address: user.business?.address || '', phone: user.business?.phone || '', cuisines: (user.business?.cuisines || []).join(', ') }); }, [user]);
  async function submit(event) { event.preventDefault(); setSaving(true); setMessage(''); setError(''); const data = new FormData(); Object.entries(form).forEach(([key, value]) => data.append(key, value)); if (logo) data.append('logo', logo); try { const result = await partnersApi.updatePartner(data); updateUser(result.partner); setMessage('Business profile updated.'); } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Could not update your business profile.'); } finally { setSaving(false); } }
  if (!user) return <Loader />;
  return <div className="content-page settings-page"><div className="page-heading"><div><span className="eyebrow">Your kitchen</span><h1>Tell your story.</h1><p>Give diners a reason to remember your business.</p></div></div><form className="panel form-stack partner-form" onSubmit={submit}><label>Business name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="4" /></label><div className="form-grid"><label>Address<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label><label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label></div><label>Cuisines<input value={form.cuisines} onChange={(event) => setForm({ ...form, cuisines: event.target.value })} placeholder="Indian, Street Food" /></label><ImageUploadField label="Business logo (max 5MB)" onChange={setLogo} />{message && <div className="success-message">{message}</div>}{error && <div className="form-error">{error}</div>}<button className="button button-accent" disabled={saving}>{saving ? 'Saving…' : 'Save business profile'}</button></form></div>;
}
