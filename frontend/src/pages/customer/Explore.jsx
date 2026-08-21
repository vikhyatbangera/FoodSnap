import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as foodsApi from '../../api/foods';
import * as searchApi from '../../api/search';
import FoodCard from '../../components/FoodCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const tab = params.get('tab') || 'foods';
  const [input, setInput] = useState(query);
  const [foods, setFoods] = useState([]);
  const [results, setResults] = useState({ reels: [], partners: [] });
  const [filters, setFilters] = useState({ category: params.get('category') || '', minPrice: params.get('minPrice') || '', maxPrice: params.get('maxPrice') || '', minRating: params.get('minRating') || '', sort: params.get('sort') || 'trending' });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const foodParams = Object.fromEntries(Object.entries({ q: query, ...filters, limit: 12 }).filter(([, value]) => value !== ''));
      const foodRequest = foodsApi.listFoods(foodParams);
      const searchRequest = query ? searchApi.search({ q: query, type: 'all' }) : Promise.resolve({ reels: [], partners: [] });
      Promise.all([foodRequest, searchRequest]).then(([foodResult, searchResult]) => { setFoods(foodResult.foods || []); setResults(searchResult); }).catch(() => {}).finally(() => setLoading(false));
    }, 280);
    return () => clearTimeout(timer);
  }, [query, filters]);
  function submit(event) { event.preventDefault(); const next = new URLSearchParams(params); if (input.trim()) next.set('q', input.trim()); else next.delete('q'); setParams(next); }
  function setFilter(key, value) { const next = { ...filters, [key]: value }; setFilters(next); const nextParams = new URLSearchParams(params); Object.entries(next).forEach(([name, item]) => item ? nextParams.set(name, item) : nextParams.delete(name)); setParams(nextParams); }
  return <div className="explore-page"><div className="page-heading"><div><span className="eyebrow">Search the city</span><h1>Explore your next craving.</h1><p>Search dishes, reels, and the kitchens behind them.</p></div></div><form className="explore-search" onSubmit={submit}><span>⌕</span><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Try “pasta”, “fresh”, or a kitchen name" /><button className="button button-accent">Search</button></form><div className="explore-tabs">{[['foods', 'Dishes'], ['reels', 'Reels'], ['partners', 'Partners']].map(([value, label]) => <button key={value} className={tab === value ? 'active' : ''} onClick={() => { const next = new URLSearchParams(params); next.set('tab', value); setParams(next); }}>{label}<small>{value === 'foods' ? foods.length : results[value]?.length || 0}</small></button>)}</div>{tab === 'foods' && <div className="filter-row"><select value={filters.category} onChange={(event) => setFilter('category', event.target.value)}><option value="">All categories</option>{['Curry', 'Biryani', 'Noodles', 'Pasta', 'Pizza', 'Salad', 'Bowls', 'Dessert', 'Smoothie', 'Wraps', 'Soup'].map((item) => <option key={item}>{item}</option>)}</select><input type="number" min="0" placeholder="Min $" value={filters.minPrice} onChange={(event) => setFilter('minPrice', event.target.value)} /><input type="number" min="0" placeholder="Max $" value={filters.maxPrice} onChange={(event) => setFilter('maxPrice', event.target.value)} /><select value={filters.minRating} onChange={(event) => setFilter('minRating', event.target.value)}><option value="">Any rating</option><option value="4">4+ stars</option><option value="4.5">4.5+ stars</option></select><select value={filters.sort} onChange={(event) => setFilter('sort', event.target.value)}><option value="trending">Trending</option><option value="rating">Top rated</option><option value="price_asc">Lowest price</option><option value="price_desc">Highest price</option><option value="newest">Newest</option></select></div>}{loading ? <Loader /> : tab === 'foods' ? (foods.length ? <div className="food-grid">{foods.map((food) => <FoodCard key={food._id} food={food} />)}</div> : <EmptyState title="No dishes matched" message="Try a broader search or another filter." />) : tab === 'reels' ? (results.reels?.length ? <div className="result-list">{results.reels.map((reel) => <Link className="result-card" to="/reels" key={reel._id}><img src={reel.thumbnail || reel.food?.image} alt="" /><span><strong>{reel.caption || reel.food?.name}</strong><small>{reel.partner?.business?.name || reel.partner?.name}</small></span>▶</Link>)}</div> : <EmptyState title="No reels matched" />) : (results.partners?.length ? <div className="partner-strip">{results.partners.map((partner) => <Link className="partner-card" key={partner._id} to={`/partners/${partner._id}`}><span className="partner-avatar">{partner.business?.name?.charAt(0) || partner.name.charAt(0)}</span><strong>{partner.business?.name || partner.name}</strong><small>{partner.business?.description || 'A kitchen worth discovering.'}</small></Link>)}</div> : <EmptyState title="No partner matched" />)}</div>;
}
