import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as foodsApi from '../../api/foods';
import FoodCard from '../../components/FoodCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    foodsApi.listFoods({ sort: 'trending', limit: 6 })
      .then((result) => setFoods(result.foods))
      .catch(() => setError('We could not load the kitchen right now.'))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="content-page">
      <section className="hero-banner">
        <div><span className="eyebrow">Good food, good mood</span><h1>Find the flavour<br /><em>of your day.</em></h1><p>Local kitchens, honest ingredients, and a little inspiration for whatever you’re craving.</p><Link className="button button-dark" to="/explore">Explore the menu <span>→</span></Link></div>
        <div className="hero-illustration"><span className="hero-spark spark-one">✦</span><span className="hero-plate">🍛</span><span className="hero-spark spark-two">✦</span></div>
      </section>
      <div className="section-heading"><div><span className="eyebrow">Picked for you</span><h2>Trending right now</h2></div><Link to="/explore">See all <span>→</span></Link></div>
      {loading && <Loader />}
      {error && <div className="form-error">{error}</div>}
      {!loading && !error && (foods.length ? <div className="food-grid">{foods.map((food) => <FoodCard key={food._id} food={food} />)}</div> : <EmptyState />)}
    </div>
  );
}
