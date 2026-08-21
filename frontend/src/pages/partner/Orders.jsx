import { useEffect, useState } from 'react';
import * as ordersApi from '../../api/orders';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const transitions = { placed: ['accepted', 'cancelled'], accepted: ['preparing', 'cancelled'], preparing: ['out_for_delivery'], out_for_delivery: ['delivered'], delivered: [], cancelled: [] };

export default function PartnerOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  function load() { setLoading(true); return ordersApi.listPartnerOrders(status ? { status, limit: 100 } : { limit: 100 }).then((result) => { setOrders(result.orders || []); setSelected((current) => current ? result.orders.find((order) => order._id === current._id) || null : result.orders[0] || null); }).catch(() => setError('We could not load incoming orders.')).finally(() => setLoading(false)); }
  useEffect(() => { load(); }, [status]);
  async function advance(next) { try { await ordersApi.updateOrderStatus(selected._id, next); await load(); } catch (requestError) { setError(requestError.response?.data?.error?.message || 'That status change is not available.'); } }
  if (loading) return <Loader />;
  return <div className="content-page partner-management"><div className="page-heading"><div><span className="eyebrow">Incoming orders</span><h1>Keep every order moving.</h1><p>Review customer details and advance only when the kitchen is ready.</p></div><select className="status-filter" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}</select></div>{error && <div className="form-error">{error}</div>}{!orders.length ? <EmptyState title="No incoming orders" message="New orders from diners will appear here." /> : <div className="order-board"><section className="panel order-board-list">{orders.map((order) => <button className={selected?._id === order._id ? 'order-board-card selected' : 'order-board-card'} key={order._id} onClick={() => setSelected(order)}><span className="eyebrow">{order.status.replaceAll('_', ' ')}</span><strong>{order.customer?.name || 'Customer'}</strong><small>{order.items?.length || 0} items · ${Number(order.total).toFixed(2)}</small><time>{new Date(order.createdAt).toLocaleDateString()}</time></button>)}</section>{selected && <section className="panel order-detail-panel"><span className="eyebrow">Order detail</span><h2>#{selected._id.slice(-6).toUpperCase()}</h2><div className="order-customer"><strong>{selected.customer?.name}</strong><small>{selected.customer?.email}</small><span>{selected.address}</span></div><div className="summary-list">{selected.items.map((item) => <div className="summary-item split-row" key={item._id || item.food}><span>{item.quantity} × {item.name}</span><b>${(Number(item.price) * item.quantity).toFixed(2)}</b></div>)}</div><div className="split-row total-row"><span>Total</span><strong>${Number(selected.total).toFixed(2)}</strong></div><div className="status-actions"><span>Next step</span>{transitions[selected.status].length ? transitions[selected.status].map((next) => <button className={next === 'cancelled' ? 'button button-ghost danger-button' : 'button button-accent'} key={next} onClick={() => advance(next)}>{next.replaceAll('_', ' ')}</button>) : <span className="muted">This order is complete.</span>}</div></section>}</div>}</div>;
}
