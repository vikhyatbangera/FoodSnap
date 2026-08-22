import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import * as foodsApi from '../../api/foods';
import * as interactionsApi from '../../api/interactions';
import { useCart } from '../../context/CartContext';
import RatingStars from '../../components/RatingStars';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { BookmarkIcon, HeartIcon } from '../../components/InteractionIcons';
import { mediaUrl } from '../../utils/media';

export default function FoodDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([foodsApi.getFood(id), foodsApi.listReviews(id, { limit: 10 })])
      .then(([detail, reviewResult]) => { setData(detail); setReviews(reviewResult.reviews || []); })
      .catch(() => setError('We could not find that dish.'))
      .finally(() => { setLoading(false); setReviewLoading(false); });
  }, [id]);
  if (loading) return <Loader />;
  if (error || !data) return <div className="form-error">{error || 'Dish not found.'}</div>;
  const { food, partner, reels, reviewSummary } = data;
  async function interact(type) {
    const result = await (type === 'like' ? interactionsApi.toggleLike('food', food._id) : interactionsApi.toggleSave('food', food._id));
    setData((current) => ({ ...current, food: { ...current.food, ...result } }));
  }
  async function submitReview(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const result = await foodsApi.createReview(food._id, { rating, comment });
      setReviews((current) => [result.review || result, ...current]);
      setMessage('Thanks for sharing your taste.');
      setComment('');
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'We could not submit that review.');
    }
  }
  return <div className="detail-page">
    <Link className="back-link" to="/explore">← Back to explore</Link>
    <div className="detail-hero"><div className="detail-image"><img src={mediaUrl(food.image)} alt={food.name} /></div><div className="detail-copy"><span className="eyebrow">{food.category || 'Featured dish'}</span><h1>{food.name}</h1><p className="detail-description">{food.description}</p><div className="detail-meta"><RatingStars value={reviewSummary.ratingAvg || food.ratingAvg} count={reviewSummary.ratingCount || food.ratingCount} /><strong>${Number(food.price).toFixed(2)}</strong></div><p className="muted">{food.isAvailable ? 'Available now · made fresh to order' : 'Currently unavailable'}</p><div className="detail-actions"><div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(99, quantity + 1))} aria-label="Increase quantity">+</button></div><button className="button button-accent" disabled={!food.isAvailable} onClick={() => addItem(food._id, quantity)}>Add to cart</button><button className={food.liked ? 'icon-button pressed' : 'icon-button'} onClick={() => interact('like')} aria-label={food.liked ? 'Unlike food' : 'Like food'} aria-pressed={Boolean(food.liked)}><HeartIcon filled={food.liked} /> {food.likeCount || 0}</button><button className={food.saved ? 'icon-button pressed' : 'icon-button'} onClick={() => interact('save')} aria-label={food.saved ? 'Unsave food' : 'Save food'} aria-pressed={Boolean(food.saved)}><BookmarkIcon filled={food.saved} /> {food.saveCount || 0}</button></div><Link className="partner-link" to={`/partners/${partner._id}`}><span className="partner-avatar">{partner.business?.name?.charAt(0) || partner.name.charAt(0)}</span><span><small>Made by</small><b>{partner.business?.name || partner.name}</b></span>→</Link></div></div>
    {reels.length > 0 && <section className="detail-section"><div className="section-heading"><div><span className="eyebrow">A taste in motion</span><h2>From the kitchen</h2></div></div><div className="linked-reels">{reels.map((reel) => <Link key={reel._id} to="/reels" className="linked-reel"><img src={mediaUrl(reel.thumbnail || food.image)} alt="" /><span>▶</span></Link>)}</div></section>}
    <section className="detail-section"><div className="section-heading"><div><span className="eyebrow">Diner notes</span><h2>Reviews <small>({reviewSummary.ratingCount || 0})</small></h2></div></div>{reviewLoading ? <Loader /> : reviews.length ? <div className="review-list">{reviews.map((review) => <article className="review-card" key={review._id}><div className="split-row"><strong>{review.customer?.name || 'Diner'}</strong><RatingStars value={review.rating} /></div><p>{review.comment || 'A delicious bite.'}</p></article>)}</div> : <EmptyState title="No reviews yet" message="Be the first to taste and tell." />}</section>
    <section className="detail-section review-form-section"><div><span className="eyebrow">Your take</span><h2>Have you tried it?</h2><p className="muted">Reviews unlock after a delivered order containing this dish.</p></div><form className="review-form" onSubmit={submitReview}><label>Rating<select value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></label><label>Note<textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What stood out?" rows="3" /></label>{(searchParams.get('review') || message || error) && <>{message && <div className="success-message">{message}</div>}{error && <div className="form-error">{error}</div>}</>}<button className="button button-dark">Share review</button></form></section>
  </div>;
}
