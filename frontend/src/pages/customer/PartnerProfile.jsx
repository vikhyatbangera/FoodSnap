import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as partnersApi from '../../api/partners';
import FoodCard from '../../components/FoodCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function PartnerProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { partnersApi.getPartner(id).then(setData).catch(() => setError('We could not find that kitchen.')); }, [id]);
  if (error) return <div className="form-error">{error}</div>;
  if (!data) return <Loader />;
  const { partner, foods, reels } = data;
  return <div className="partner-profile"><Link className="back-link" to="/explore">← Back to explore</Link><header className="partner-hero"><div className="partner-avatar partner-avatar-large">{partner.business?.name?.charAt(0) || partner.name.charAt(0)}</div><div><span className="eyebrow">{partner.business?.cuisines?.join(' · ') || 'Local kitchen'}</span><h1>{partner.business?.name || partner.name}</h1><p>{partner.business?.description || 'A kitchen making food worth finding.'}</p><small>{partner.business?.address || 'Your neighbourhood'}</small></div></header><section className="detail-section"><div className="section-heading"><div><span className="eyebrow">On the menu</span><h2>{foods.length} dishes</h2></div></div>{foods.length ? <div className="food-grid">{foods.map((food) => <FoodCard key={food._id} food={food} />)}</div> : <EmptyState title="Menu coming soon" />}</section><section className="detail-section"><div className="section-heading"><div><span className="eyebrow">Kitchen stories</span><h2>Reels</h2></div><Link to="/reels">See feed →</Link></div>{reels.length ? <div className="linked-reels">{reels.map((reel) => <Link className="linked-reel" to="/reels" key={reel._id}><img src={reel.thumbnail || reel.food?.image} alt={reel.caption || ''} /><span>▶</span></Link>)}</div> : <EmptyState title="No kitchen stories yet" />}</section></div>;
}
