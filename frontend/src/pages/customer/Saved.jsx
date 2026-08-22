import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as usersApi from '../../api/users';
import * as interactionsApi from '../../api/interactions';
import FoodCard from '../../components/FoodCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { mediaUrl } from '../../utils/media';

export default function Saved() {
  const [saved, setSaved] = useState({ foods: [], reels: [] });
  const [tab, setTab] = useState('foods');
  const [loading, setLoading] = useState(true);
  useEffect(() => { usersApi.getSaved().then(setSaved).catch(() => {}).finally(() => setLoading(false)); }, []);
  async function unsave(type, id) { await interactionsApi.toggleSave(type, id); setSaved((current) => ({ ...current, [type === 'food' ? 'foods' : 'reels']: current[type === 'food' ? 'foods' : 'reels'].filter((item) => item._id !== id) })); }
  const items = saved[tab];
  return <div className="saved-page"><div className="page-heading"><div><span className="eyebrow">Your little archive</span><h1>Saved.</h1><p>Good ideas for later, all in one place.</p></div></div><div className="segmented-tabs"><button className={tab === 'foods' ? 'active' : ''} onClick={() => setTab('foods')}>Dishes <small>{saved.foods.length}</small></button><button className={tab === 'reels' ? 'active' : ''} onClick={() => setTab('reels')}>Reels <small>{saved.reels.length}</small></button></div>{loading ? <Loader /> : items.length ? tab === 'foods' ? <div className="food-grid">{items.map((food) => <div className="saved-item" key={food._id}><FoodCard food={food} /><button className="unsave-button" onClick={() => unsave('food', food._id)}>Remove from saved</button></div>)}</div> : <div className="result-list">{items.map((reel) => <article className="result-card" key={reel._id}><img src={mediaUrl(reel.thumbnail || reel.food?.image)} alt="" /><span><strong>{reel.caption || reel.food?.name}</strong><small>{reel.partner?.business?.name || reel.partner?.name}</small></span><button className="icon-button" onClick={() => unsave('reel', reel._id)} aria-label="Unsave reel">×</button><Link to="/reels">▶</Link></article>)}</div> : <EmptyState title="Nothing saved yet" message="Tap the bookmark when something makes you hungry." action={<Link className="button button-accent" to="/explore">Explore</Link>} />}</div>;
}
