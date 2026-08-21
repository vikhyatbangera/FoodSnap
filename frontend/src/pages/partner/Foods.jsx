import { useEffect, useState } from 'react';
import * as foodsApi from '../../api/foods';
import { useAuth } from '../../context/AuthContext';
import ImageUploadField from '../../components/ImageUploadField';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const blank = { name: '', description: '', price: '', category: '', tags: '', isAvailable: true };

export default function PartnerFoods() {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [remove, setRemove] = useState(null);
  function load() { setLoading(true); return foodsApi.listFoods({ partner: user._id, limit: 100 }).then((result) => setFoods(result.foods || [])).catch(() => setError('We could not load your menu.')).finally(() => setLoading(false)); }
  useEffect(() => { load(); }, [user._id]);
  function change(event) { const { name, value, type, checked } = event.target; setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })); }
  function startEdit(food) { setEditing(food); setForm({ name: food.name, description: food.description || '', price: food.price, category: food.category || '', tags: (food.tags || []).join(', '), isAvailable: food.isAvailable }); setFile(null); }
  function reset() { setEditing(null); setForm(blank); setFile(null); setError(''); }
  async function submit(event) { event.preventDefault(); setSaving(true); setError(''); const data = new FormData(); Object.entries(form).forEach(([key, value]) => data.append(key, value)); if (file) data.append('image', file); try { if (editing) await foodsApi.updateFood(editing._id, data); else await foodsApi.createFood(data); reset(); await load(); } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Could not save this dish.'); } finally { setSaving(false); } }
  async function toggle(food) { const data = new FormData(); data.append('isAvailable', !food.isAvailable); try { await foodsApi.updateFood(food._id, data); await load(); } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Could not update availability.'); } }
  async function confirmRemove() { try { await foodsApi.deleteFood(remove._id); setRemove(null); await load(); } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Could not delete this dish.'); } }
  if (loading) return <Loader />;
  return <div className="content-page partner-management"><div className="page-heading"><div><span className="eyebrow">Your menu</span><h1>Make every plate count.</h1><p>Create, edit, and keep your availability current.</p></div><button className="button button-accent" onClick={reset}>＋ New dish</button></div>{error && <div className="form-error">{error}</div>}<div className="partner-management-grid"><section className="panel"><div className="section-heading compact-heading"><div><span className="eyebrow">Listings</span><h2>{foods.length} dishes</h2></div></div>{foods.length ? <div className="partner-food-list">{foods.map((food) => <article className="partner-food-row" key={food._id}><img src={food.image} alt={food.name} /><div><strong>{food.name}</strong><small>{food.category || 'Featured'} · ${Number(food.price).toFixed(2)}</small><span className={food.isAvailable ? 'availability available' : 'availability'}>{food.isAvailable ? 'Available' : 'Paused'}</span></div><div className="row-actions"><button className="button button-small button-ghost" onClick={() => toggle(food)}>{food.isAvailable ? 'Pause' : 'Publish'}</button><button className="button button-small button-ghost" onClick={() => startEdit(food)}>Edit</button><button className="text-button danger-text" onClick={() => setRemove(food)}>Delete</button></div></article>)}</div> : <EmptyState title="No dishes yet" message="Add your first dish to start your menu." />}</section><form className="panel form-stack partner-form" onSubmit={submit}><div><span className="eyebrow">{editing ? 'Edit listing' : 'New listing'}</span><h2>{editing ? 'Tune the details.' : 'Add a signature dish.'}</h2></div><label>Name<input name="name" value={form.name} onChange={change} required minLength="2" /></label><label>Description<textarea name="description" value={form.description} onChange={change} rows="3" /></label><div className="form-grid"><label>Price<input name="price" type="number" min="0" step=".01" value={form.price} onChange={change} required /></label><label>Category<input name="category" value={form.category} onChange={change} /></label></div><label>Tags<input name="tags" value={form.tags} onChange={change} placeholder="fresh, popular" /></label><label className="checkbox-row"><input name="isAvailable" type="checkbox" checked={form.isAvailable} onChange={change} /> Available to order</label><ImageUploadField label="Dish image (max 5MB)" onChange={setFile} /><div className="form-actions"><button className="button button-accent" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create dish'}</button>{editing && <button type="button" className="button button-ghost" onClick={reset}>Cancel</button>}</div></form></div><Modal open={Boolean(remove)} title="Remove this dish?" onClose={() => setRemove(null)}><p className="muted">This will remove {remove?.name} from your menu.</p><button className="button button-accent" onClick={confirmRemove}>Delete dish</button></Modal></div>;
}
