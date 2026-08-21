import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as foodsApi from '../../api/foods';
import * as partnersApi from '../../api/partners';
import FoodCard from '../../components/FoodCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const categoryGlyphs = { Curry: '🍛', Biryani: '🍚', Noodles: '🍜', Pasta: '🍝', Pizza: '🍕', Salad: '🥗', Bowls: '🥣', Dessert: '🍰', Smoothie: '🥭', Wraps: '🌯', Soup: '🍲' };

function Section({ eyebrow, title, action, children }) {
  return <section className="discover-section"><div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action}</div>{children}</section>;
}

export default function Home() {
  const [category, setCategory] = useState('');
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [partners, setPartners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([
      foodsApi.listFoods({ sort: 'trending', limit: 6, ...(category ? { category } : {}) }),
      foodsApi.listFoods({ sort: 'rating', limit: 4 }),
      foodsApi.listFoods({ sort: 'newest', limit: 4 }),
      partnersApi.listPartners({ limit: 6 }),
      foodsApi.listFoods({ limit: 100 })
    ]).then(([trend, rated, fresh, partnerResult, allFoods]) => {
      setTrending(trend.foods || []);
      setTopRated(rated.foods || []);
      setNearby(fresh.foods || []);
      setPartners(partnerResult.partners || []);
      setCategories([...new Set((allFoods.foods || []).map((food) => food.category).filter(Boolean))]);
    }).catch(() => setError('We could not load the kitchens right now.')).finally(() => setLoading(false));
  }, [category]);
  const categoryButtons = useMemo(() => categories.map((item) => ({ name: item, glyph: categoryGlyphs[item] || '✦' })), [categories]);
  return (
    <div className="content-page discover-page">
      <section className="hero-banner">
        <div><span className="eyebrow">Good food, good mood</span><h1>Find the flavour<br /><em>of your day.</em></h1><p>Local kitchens, honest ingredients, and a little inspiration for whatever you’re craving.</p><Link className="button button-dark" to="/explore">Explore the menu <span>→</span></Link></div>
        <div className="hero-illustration"><span className="hero-spark spark-one">✦</span><span className="hero-plate">🍛</span><span className="hero-spark spark-two">✦</span></div>
      </section>
      {loading && <Loader />}
      {error && <div className="form-error">{error}</div>}
      {!loading && !error && <>
        <div className="category-chips" aria-label="Filter by category">
          <button className={!category ? 'active' : ''} onClick={() => setCategory('')}>All cravings</button>
          {categoryButtons.map((item) => <button className={category === item.name ? 'active' : ''} key={item.name} onClick={() => setCategory(item.name)}>{item.glyph} {item.name}</button>)}
        </div>
        <Section eyebrow="Picked for you" title={category ? `${category} to try` : 'Trending right now'} action={<Link to="/explore">See all <span>→</span></Link>}>
          {trending.length ? <div className="food-grid">{trending.map((food) => <FoodCard key={food._id} food={food} />)}</div> : <EmptyState title="Nothing here yet" message="Try another craving." />}
        </Section>
        <Section eyebrow="The crowd agrees" title="Top-rated plates">
          {topRated.length ? <div className="food-grid compact-grid">{topRated.map((food) => <FoodCard key={food._id} food={food} />)}</div> : <EmptyState title="Ratings are on their way" />}
        </Section>
        <Section eyebrow="Fresh nearby" title="New around the neighbourhood">
          {nearby.length ? <div className="food-grid compact-grid">{nearby.map((food) => <FoodCard key={food._id} food={food} />)}</div> : <EmptyState title="New kitchens coming soon" />}
        </Section>
        <Section eyebrow="Meet the makers" title="Kitchens worth knowing" action={<Link to="/explore?tab=partners">All partners <span>→</span></Link>}>
          {partners.length ? <div className="partner-strip">{partners.map((partner) => <Link className="partner-card" key={partner._id} to={`/partners/${partner._id}`}><span className="partner-avatar">{partner.business?.name?.charAt(0) || partner.name.charAt(0)}</span><strong>{partner.business?.name || partner.name}</strong><small>{partner.business?.cuisines?.slice(0, 2).join(' · ') || 'Local kitchen'}</small><span className="muted">{partner.foodCount || 0} dishes</span></Link>)}</div> : <EmptyState title="No partner kitchens yet" />}
        </Section>
      </>}
    </div>
  );
}
