import { useEffect, useState } from 'react';
import * as analyticsApi from '../../api/analytics';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    analyticsApi.getOverview({ days: 30 }).then(setOverview).finally(() => setLoading(false));
  }, []);
  if (loading) return <Loader />;
  if (!overview) return <EmptyState title="Dashboard unavailable" message="We couldn't load your kitchen insights." />;
  const { totals } = overview;
  return <div className="content-page"><div className="page-heading"><div><span className="eyebrow">Your kitchen</span><h1>Good morning, partner.</h1><p>Here’s how your food is finding its people.</p></div><span className="date-chip">Last 30 days</span></div><div className="metric-grid">{[['Revenue', `$${Number(totals.revenue).toFixed(2)}`, '↗'], ['Orders', totals.orders, '▣'], ['Avg. order', `$${Number(totals.avgOrderValue).toFixed(2)}`, '◌'], ['Engagement', totals.likes + totals.saves, '✦']].map(([label, value, icon]) => <div className="metric-card" key={label}><span className="metric-icon">{icon}</span><span className="muted">{label}</span><strong>{value}</strong></div>)}</div><div className="dashboard-grid"><section className="panel"><div className="section-heading compact-heading"><div><span className="eyebrow">Momentum</span><h2>Revenue by day</h2></div></div><div className="chart-bars">{overview.revenueByDay.slice(-14).map((day) => <div className="chart-column" key={day.date} title={`${day.date}: $${day.revenue}`}><span style={{ height: `${Math.max(8, Math.min(100, day.revenue * 2.5))}%` }} /><small>{day.date.slice(8)}</small></div>)}</div></section><section className="panel"><div className="section-heading compact-heading"><div><span className="eyebrow">What’s working</span><h2>Top listings</h2></div></div>{overview.topFoods.byRevenue.length ? overview.topFoods.byRevenue.slice(0, 4).map((item) => <div className="list-row" key={item.food._id}><span className="list-avatar">✦</span><span><strong>{item.food.name}</strong><small>{item.orderCount} orders</small></span><b>${Number(item.revenue).toFixed(2)}</b></div>) : <EmptyState title="No listings yet" message="Add your first dish to see insights." />}</section></div></div>;
}
