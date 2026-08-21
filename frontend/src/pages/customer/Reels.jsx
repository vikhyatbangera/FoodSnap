import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as reelsApi from '../../api/reels';
import * as interactionsApi from '../../api/interactions';
import { useCart } from '../../context/CartContext';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

function ReelCard({ reel, onUpdate }) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const viewed = useRef(false);
  const [playing, setPlaying] = useState(true);
  const { addItem } = useCart();
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        videoRef.current?.play().catch(() => {});
        setPlaying(true);
        if (!viewed.current) {
          viewed.current = true;
          reelsApi.viewReel(reel._id).catch(() => {});
        }
      } else {
        videoRef.current?.pause();
        setPlaying(false);
      }
    }, { threshold: 0.65 });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [reel._id]);
  async function toggle(type) {
    const key = type === 'like' ? 'liked' : 'saved';
    const api = type === 'like' ? interactionsApi.toggleLike : interactionsApi.toggleSave;
    const countKey = type === 'like' ? 'likeCount' : 'saveCount';
    const current = Boolean(reel[key]);
    onUpdate(reel._id, { [key]: !current, [countKey]: Math.max(0, (reel[countKey] || 0) + (current ? -1 : 1)) });
    try {
      onUpdate(reel._id, await api('reel', reel._id));
    } catch (error) {
      void error;
      onUpdate(reel._id, { [key]: current, [countKey]: reel[countKey] || 0 });
    }
  }
  function togglePlay() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play().catch(() => {}); setPlaying(true); } else { videoRef.current.pause(); setPlaying(false); }
  }
  return <article className="reel-card" ref={cardRef}>
    <video ref={videoRef} src={reel.video} poster={reel.thumbnail} autoPlay muted loop playsInline onClick={togglePlay} aria-label={reel.caption || 'Food reel'} />
    <div className="reel-shade" />
    {!playing && <button className="reel-play" onClick={togglePlay} aria-label="Play reel">▶</button>}
    <div className="reel-copy"><span className="eyebrow">From {reel.partner?.business?.name || reel.partner?.name || 'a local kitchen'}</span><h2>{reel.caption || 'A delicious moment.'}</h2><p>Tap the video to {playing ? 'pause' : 'play'} · sound off</p>{reel.food && <Link className="reel-food-card" to={`/foods/${reel.food._id}`}><img src={reel.food.image} alt="" /><span><b>{reel.food.name}</b><small>${Number(reel.food.price || 0).toFixed(2)} · {reel.food.category}</small></span><button type="button" onClick={(event) => { event.preventDefault(); addItem(reel.food._id); }}>Order this</button></Link>}</div>
    <div className="reel-actions"><button onClick={() => toggle('like')} className={reel.liked ? 'active' : ''} aria-label="Like reel">♥<small>{reel.likeCount || 0}</small></button><button onClick={() => toggle('save')} className={reel.saved ? 'active' : ''} aria-label="Save reel">▱<small>{reel.saveCount || 0}</small></button></div>
  </article>;
}

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback((page = 1) => {
    const setter = page === 1 ? setLoading : setLoadingMore;
    setter(true);
    return reelsApi.listReels({ page, limit: 5, sort: 'trending' }).then((result) => {
      setReels((current) => page === 1 ? result.reels : [...current, ...result.reels]);
      setPagination(result.pagination);
    }).catch(() => setError('We could not load reels right now.')).finally(() => setter(false));
  }, []);
  useEffect(() => { load(); }, [load]);
  function update(id, updates) { setReels((current) => current.map((reel) => reel._id === id ? { ...reel, ...updates } : reel)); }
  return <div className="reels-page">{loading && <Loader />}{error && <div className="form-error">{error}</div>}{!loading && !reels.length && <EmptyState title="No reels yet" message="Check back soon for kitchen stories." />}{reels.length > 0 && <><div className="reels-feed">{reels.map((reel) => <ReelCard key={reel._id} reel={reel} onUpdate={update} />)}</div>{pagination?.page < pagination?.pages && <button className="button button-ghost load-more" disabled={loadingMore} onClick={() => load(pagination.page + 1)}>{loadingMore ? 'Loading…' : 'Load more stories'}</button>}</>}</div>;
}
