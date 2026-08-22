import { useEffect, useState } from 'react';
import * as foodsApi from '../../api/foods';
import * as reelsApi from '../../api/reels';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { mediaUrl } from '../../utils/media';

const blank = { caption: '', foodId: '' };
const maxVideo = 50 * 1024 * 1024;

export default function PartnerReels() {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(blank);
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [remove, setRemove] = useState(null);
  function load() { setLoading(true); return Promise.all([reelsApi.listReels({ partner: user._id, limit: 50 }), foodsApi.listFoods({ partner: user._id, limit: 100 })]).then(([reelResult, foodResult]) => { setReels(reelResult.reels || []); setFoods(foodResult.foods || []); }).catch(() => setError('We could not load your stories.')).finally(() => setLoading(false)); }
  useEffect(() => { load(); }, [user._id]);
  function reset() { setForm(blank); setVideo(null); setThumbnail(null); setEditing(null); setProgress(0); }
  function validFile(file, type) { if (!file) return true; if (!file.type.startsWith(`${type}/`)) { setError(`${type === 'video' ? 'Video' : 'Thumbnail'} file type is not supported.`); return false; } if (file.size > (type === 'video' ? maxVideo : 5 * 1024 * 1024)) { setError(`${type === 'video' ? 'Video' : 'Thumbnail'} is too large.`); return false; } return true; }
  async function submit(event) { event.preventDefault(); setError(''); if (!editing && !validFile(video, 'video')) return; if (thumbnail && !validFile(thumbnail, 'image')) return; const data = new FormData(); data.append('caption', form.caption); if (form.foodId) data.append('foodId', form.foodId); if (video) data.append('video', video); if (thumbnail) data.append('thumbnail', thumbnail); setSaving(true); try { const config = { onUploadProgress: (event) => setProgress(event.total ? Math.round((event.loaded / event.total) * 100) : 0) }; if (editing) await reelsApi.updateReel(editing._id, data, config); else await reelsApi.createReel(data, config); reset(); await load(); } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Could not save this story.'); } finally { setSaving(false); } }
  function edit(reel) { setEditing(reel); setForm({ caption: reel.caption || '', foodId: reel.food?._id || '' }); setVideo(null); setThumbnail(null); }
  async function removeReel() { try { await reelsApi.deleteReel(remove._id); setRemove(null); await load(); } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Could not delete this story.'); } }
  if (loading) return <Loader />;
  return <div className="content-page partner-management"><div className="page-heading"><div><span className="eyebrow">Kitchen stories</span><h1>Show the work behind the bite.</h1><p>Upload a reel, link a dish, and give diners a reason to stop scrolling.</p></div></div>{error && <div className="form-error">{error}</div>}<div className="partner-management-grid"><section className="panel"><div className="section-heading compact-heading"><div><span className="eyebrow">Your reels</span><h2>{reels.length} stories</h2></div></div>{reels.length ? <div className="reel-management-grid">{reels.map((reel) => <article className="reel-management-card" key={reel._id}>{reel.thumbnail && <img src={mediaUrl(reel.thumbnail)} alt="" />}<div><strong>{reel.caption || 'Kitchen story'}</strong><small>{reel.food?.name || 'No linked dish'}</small><span>{reel.views || 0} views · {reel.likeCount || 0} likes · {reel.saveCount || 0} saves</span></div><div className="row-actions"><button className="button button-small button-ghost" onClick={() => edit(reel)}>Edit</button><button className="text-button danger-text" onClick={() => setRemove(reel)}>Delete</button></div></article>)}</div> : <EmptyState title="No stories yet" message="Upload your first reel to bring the kitchen to life." />}</section><form className="panel form-stack partner-form" onSubmit={submit}><span className="eyebrow">{editing ? 'Edit story' : 'New story'}</span><h2>{editing ? 'Refresh the caption.' : 'Upload a reel.'}</h2><label>Caption<textarea value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} rows="3" placeholder="What is happening in the kitchen?" /></label><label>Linked food<select value={form.foodId} onChange={(event) => setForm({ ...form, foodId: event.target.value })}><option value="">No linked dish</option>{foods.map((food) => <option key={food._id} value={food._id}>{food.name}</option>)}</select></label><label className="upload-field"><span>Video {editing ? '(optional replacement)' : '(MP4/WebM, max 50MB)'}</span><input type="file" accept="video/*" onChange={(event) => setVideo(event.target.files?.[0] || null)} />{video && <span className="upload-placeholder">{video.name}</span>}</label><label className="upload-field"><span>Thumbnail (optional, max 5MB)</span><input type="file" accept="image/*" onChange={(event) => setThumbnail(event.target.files?.[0] || null)} />{thumbnail && <span className="upload-placeholder">{thumbnail.name}</span>}</label>{saving && <div className="upload-progress"><span style={{ width: `${progress}%` }} /><small>{progress}% uploading</small></div>}<div className="form-actions"><button className="button button-accent" disabled={saving}>{saving ? 'Uploading…' : editing ? 'Save story' : 'Upload story'}</button>{editing && <button type="button" className="button button-ghost" onClick={reset}>Cancel</button>}</div></form></div><Modal open={Boolean(remove)} title="Delete this story?" onClose={() => setRemove(null)}><p className="muted">This reel will disappear from your kitchen feed.</p><button className="button button-accent" onClick={removeReel}>Delete reel</button></Modal></div>;
}
