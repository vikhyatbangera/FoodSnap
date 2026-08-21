import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function FoodCard({ food }) {
  const { addItem, clear } = useCart();

  async function handleAdd() {
    try {
      await addItem(food._id);
      toast.success(`${food.name} added to cart!`);
    } catch (err) {
      if (err.response?.status === 409) {
        toast((t) => (
          <div>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
              Your cart has items from another partner. Clear it and add this dish instead?
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button 
                className="button button-small"
                onClick={() => toast.dismiss(t.id)}
              >
                Cancel
              </button>
              <button 
                className="button button-small button-accent"
                onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    await clear();
                    await addItem(food._id);
                    toast.success(`${food.name} added to cart!`);
                  } catch (e) {
                    toast.error("Could not add to cart.");
                  }
                }}
              >
                Clear & Add
              </button>
            </div>
          </div>
        ), { duration: Infinity });
      } else {
        toast.error(err.response?.data?.error?.message || "Could not add to cart.");
      }
    }
  }

  return (
    <article className="food-card">
      <Link to={`/foods/${food._id}`} className="food-card-image">
        {food.image ? <img src={food.image} alt={food.name} /> : <span>🍜</span>}
        <span className="category-pill">{food.category || 'Featured'}</span>
      </Link>
      <div className="food-card-body">
        <div className="split-row"><h3><Link to={`/foods/${food._id}`}>{food.name}</Link></h3><strong>${Number(food.price || 0).toFixed(2)}</strong></div>
        <p className="muted clamp">{food.description || 'Made fresh for your table.'}</p>
        <div className="split-row card-footer">
          <RatingStars value={food.ratingAvg} count={food.ratingCount} />
          <button className="button button-small button-accent" onClick={handleAdd} aria-label={`Add ${food.name} to cart`}>＋ Add</button>
        </div>
      </div>
    </article>
  );
}
