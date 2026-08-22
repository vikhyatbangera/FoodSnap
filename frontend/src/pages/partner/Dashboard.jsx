import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as analyticsApi from '../../api/analytics';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { mediaUrl } from '../../utils/media';

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function RevenueChart({ days }) {
  const values = days.map((day) => Number(day.revenue || 0));
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - (value / max) * 84 - 8}`).join(' ');
  return <div className="revenue-chart"><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Revenue over time"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" /><polyline points={`0,100 ${points} 100,100`} fill="currentColor" opacity=".12" /></svg><div className="chart-labels"><small>{days[0]?.date || ''}</small><small>{days[Math.floor(days.length / 2)]?.date || ''}</small><small>{days[days.length - 1]?.date || ''}</small></div></div>;
}

function Ranking({ title, items, value }) {
  return <section className="panel"><div className="section-heading compact-heading"><div><span className="eyebrow">Performance</span><h2>{title}</h2></div></div>{items.length ? items.map((item) => <div className="list-row" key={item.food._id}><img className="list-thumb" src={mediaUrl(item.food.image)} alt="" /><span><strong>{item.food.name}</strong><small>{item.orderCount || 0} orders</small></span><b>{value(item)}</b></div>) : <EmptyState title="Nothing to show yet" message="Your next sale will appear here." />}</section>;
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true);
    analyticsApi.getOverview({ days }).then(setOverview).catch(() => setError('We could not load your kitchen insights.')).finally(() => setLoading(false));
  }, [days]);
  const statusRows = useMemo(() => Object.entries(overview?.ordersByStatus || {}), [overview]);
  if (loading && !overview) return <Loader />;
  if (error && !overview) return <div className="form-error">{error}</div>;
  if (!overview) return <EmptyState title="Dashboard unavailable" message="Try refreshing your kitchen space." />;
  const { totals } = overview;
  const metrics = [['Revenue', money(totals.revenue)], ['Orders', totals.orders], ['Average order', money(totals.avgOrderValue)], ['Likes', totals.likes], ['Saves', totals.saves], ['Reel views', totals.reelViews], ['Rating', Number(totals.ratingAvg || 0).toFixed(1)], ['Reviews', totals.reviewCount]];
  return <div className="content-page partner-dashboard"><div className="page-heading"><div><span className="eyebrow">Your kitchen</span><h1>Good morning, partner.</h1><p>Here’s how your food is finding its people.</p></div><label className="range-select">Window<select value={days} onChange={(event) => setDays(Number(event.target.value))}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label></div>{error && <div className="form-error">{error}</div>}<div className="metric-grid partner-metrics">{metrics.map(([label, value]) => <div className="metric-card" key={label}><span className="muted">{label}</span><strong>{value}</strong></div>)}</div><section className="panel chart-panel"><div className="section-heading compact-heading"><div><span className="eyebrow">Momentum</span><h2>Revenue over time</h2></div><span className="muted">{days} days</span></div><RevenueChart days={overview.revenueByDay} /></section><div className="dashboard-grid"><Ranking title="Top foods by revenue" items={overview.topFoods.byRevenue} value={(item) => money(item.revenue)} /><Ranking title="Top foods by orders" items={overview.topFoods.byOrderCount} value={(item) => `${item.orderCount || 0} orders`} /></div><div className="dashboard-grid"><Ranking title="Trending listings" items={overview.trendingFoods} value={(item) => `${item.trendingScore || 0} pulse`} /><section className="panel"><div className="section-heading compact-heading"><div><span className="eyebrow">Operations</span><h2>Orders by status</h2></div></div>{statusRows.length ? statusRows.map(([status, count]) => <div className="status-row" key={status}><span>{status.replaceAll('_', ' ')}</span><strong>{count}</strong></div>) : <EmptyState title="No orders yet" message="Orders will appear here as diners discover you." />}</section></div><section className="panel"><div className="section-heading compact-heading"><div><span className="eyebrow">Content</span><h2>Top reels</h2></div><Link to="/partner/reels/new">Manage reels →</Link></div>{overview.topReels.length ? <div className="reel-mini-grid">{overview.topReels.map((reel) => <div className="reel-mini-card" key={reel._id}>{reel.thumbnail && <img src={mediaUrl(reel.thumbnail)} alt="" />}<strong>{reel.caption || 'Kitchen story'}</strong><small>{reel.views} views</small></div>)}</div> : <EmptyState title="No reels yet" message="Share a story from your kitchen." />}</section></div>;
}
