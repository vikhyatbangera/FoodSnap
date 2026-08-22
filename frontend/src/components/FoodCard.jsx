import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';
import { useCart } from '../context/CartContext';
import { mediaUrl } from '../utils/media';

export default function FoodCard({ food }) {
  const { addItem } = useCart();
  return (
    <article className="food-card">
      <Link to={`/foods/${food._id}`} className="food-card-image">
        {food.image ? <img src={mediaUrl(food.image)} alt={food.name} /> : <span>🍜</span>}
        <span className="category-pill">{food.category || 'Featured'}</span>
      </Link>
      <div className="food-card-body">
        <div className="split-row"><h3><Link to={`/foods/${food._id}`}>{food.name}</Link></h3><strong>${Number(food.price || 0).toFixed(2)}</strong></div>
        <p className="muted clamp">{food.description || 'Made fresh for your table.'}</p>
        <div className="split-row card-footer">
          <RatingStars value={food.ratingAvg} count={food.ratingCount} />
          <button className="button button-small button-accent" onClick={() => addItem(food._id)} aria-label={`Add ${food.name} to cart`}>＋ Add</button>
        </div>
      </div>
    </article>
  );
}
