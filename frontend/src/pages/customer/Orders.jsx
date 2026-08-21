import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as ordersApi from '../../api/orders';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const labels = { placed: 'Placed', accepted: 'Accepted', preparing: 'Preparing', out_for_delivery: 'On the way', delivered: 'Delivered', cancelled: 'Cancelled' };

export function OrderCard({ order }) {
  return <Link className="order-card" to={`/orders/${order._id}`}><div className="order-card-top"><span className={`status-dot status-${order.status}`} /> <strong>{labels[order.status] || order.status}</strong><small>{new Date(order.createdAt).toLocaleDateString()}</small></div><div className="order-card-main"><div>{order.items?.slice(0, 2).map((item) => <span key={item._id || item.name}>{item.quantity} × {item.name}</span>)}</div><strong>${Number(order.total || 0).toFixed(2)}</strong></div><small>{order.partner?.business?.name || order.partner?.name}</small></Link>;
}

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('status') === 'past' ? 'past' : 'active';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); ordersApi.listMyOrders({ status: tab }).then((result) => setOrders(result.orders || [])).catch(() => setOrders([])).finally(() => setLoading(false)); }, [tab]);
  return <div className="orders-page"><div className="page-heading"><div><span className="eyebrow">Your food story</span><h1>Orders.</h1><p>Keep an eye on every delicious detail.</p></div></div><div className="segmented-tabs"><button className={tab === 'active' ? 'active' : ''} onClick={() => setParams({ status: 'active' })}>In progress</button><button className={tab === 'past' ? 'active' : ''} onClick={() => setParams({ status: 'past' })}>Past orders</button></div>{loading ? <Loader /> : orders.length ? <div className="order-list">{orders.map((order) => <OrderCard key={order._id} order={order} />)}</div> : <EmptyState title={tab === 'active' ? 'No active orders' : 'No past orders'} message="Your next favourite meal is a few taps away." />}</div>;
}
