import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as ordersApi from '../../api/orders';
import Loader from '../../components/Loader';

const labels = { placed: 'Order placed', accepted: 'Kitchen accepted it', preparing: 'Being prepared', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { ordersApi.getOrder(id).then((result) => setOrder(result.order)).catch(() => setError('We could not find that order.')); }, [id]);
  if (error) return <div className="form-error">{error}</div>;
  if (!order) return <Loader />;
  async function cancel() { try { const result = await ordersApi.updateOrderStatus(id, 'cancelled'); setOrder(result.order); } catch (requestError) { setError(requestError.response?.data?.error?.message || 'That order can no longer be cancelled.'); } }
  return <div className="order-detail-page"><Link className="back-link" to="/orders">← All orders</Link><div className="page-heading"><div><span className="eyebrow">{order.partner?.business?.name || order.partner?.name}</span><h1>Order details.</h1><p>Placed {new Date(order.createdAt).toLocaleString()}</p></div><span className={`status-badge status-${order.status}`}>{labels[order.status]}</span></div>{error && <div className="form-error">{error}</div>}<div className="order-detail-grid"><section className="panel"><h3>Order timeline</h3><div className="timeline">{order.statusHistory?.map((step) => <div className={`timeline-step ${step.status === order.status ? 'current' : ''}`} key={`${step.status}-${step.at}`}><span className="timeline-dot" /><div><strong>{labels[step.status]}</strong><small>{new Date(step.at).toLocaleString()}</small></div></div>)}</div>{order.status === 'placed' && <button className="button button-ghost" onClick={cancel}>Cancel order</button>}</section><aside className="panel order-summary"><h3>Delivered to</h3><p className="muted">{order.address}</p>{order.items?.map((item) => <div className="split-row summary-item" key={item._id || item.name}><span>{item.quantity} × {item.name}</span><strong>${(Number(item.price) * item.quantity).toFixed(2)}</strong></div>)}<hr /><div className="split-row"><span>Subtotal</span><strong>${Number(order.subtotal).toFixed(2)}</strong></div><div className="split-row"><span>Delivery</span><strong>${Number(order.deliveryFee).toFixed(2)}</strong></div><div className="split-row total-row"><span>Total</span><strong>${Number(order.total).toFixed(2)}</strong></div></aside></div>{order.status === 'delivered' && order.items?.[0]?.food && <button className="button button-accent" onClick={() => navigate(`/foods/${order.items[0].food._id || order.items[0].food}?review=1`)}>Rate this dish</button>}</div>;
}
