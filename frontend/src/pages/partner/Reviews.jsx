import { useEffect, useState } from 'react';
import * as analyticsApi from '../../api/analytics';
import * as foodsApi from '../../api/foods';
import RatingStars from '../../components/RatingStars';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';

export default function PartnerReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ ratingAvg: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    foodsApi.listFoods({ partner: user._id, limit: 100 }).then(async (result) => {
      const all = await Promise.all((result.foods || []).map(async (food) => { const response = await foodsApi.listReviews(food._id, { limit: 100 }); return (response.reviews || []).map((review) => ({ ...review, food })); }));
      setReviews(all.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }).then(() => analyticsApi.getOverview({ days: 365 })).then((overview) => setSummary({ ratingAvg: overview.totals.ratingAvg, reviewCount: overview.totals.reviewCount })).catch(() => setError('We could not load your reviews.')).finally(() => setLoading(false));
  }, [user._id]);
  if (loading) return <Loader />;
  return <div className="content-page partner-management"><div className="page-heading"><div><span className="eyebrow">Diner notes</span><h1>Listen to your diners.</h1><p>Every review is a small clue for what to make next.</p></div><div className="review-summary"><strong>{Number(summary.ratingAvg || 0).toFixed(1)}</strong><RatingStars value={summary.ratingAvg} /><small>{summary.reviewCount} reviews</small></div></div>{error && <div className="form-error">{error}</div>}{reviews.length ? <div className="review-inbox">{reviews.map((review) => <article className="panel partner-review-card" key={review._id}><div className="split-row"><div><span className="eyebrow">{review.food.name}</span><h3>{review.customer?.name || 'Diner'}</h3></div><RatingStars value={review.rating} /></div><p>{review.comment || 'No written note.'}</p><time>{new Date(review.createdAt).toLocaleDateString()}</time></article>)}</div> : <EmptyState title="No reviews yet" message="Diner notes will appear after delivered orders." />}</div>;
}
