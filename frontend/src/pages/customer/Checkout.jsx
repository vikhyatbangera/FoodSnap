import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ordersApi from '../../api/orders';
import { useCart } from '../../context/CartContext';
import EmptyState from '../../components/EmptyState';

export default function Checkout() {
  const { cart, clear } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const items = cart.items || [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.food?.price || 0) * item.quantity, 0);
  if (!items.length) return <EmptyState title="Nothing to check out" action={<button className="button button-accent" onClick={() => navigate('/explore')}>Find a dish</button>} />;
  async function submit(event) {
    event.preventDefault(); setError(''); setPlacing(true);
    try { const { order } = await ordersApi.placeOrder({ address }); await clear(); navigate(`/orders/${order._id}`); } catch (requestError) { setError(requestError.response?.data?.error?.message || 'We could not place that order.'); } finally { setPlacing(false); }
  }
  return <div className="checkout-page"><div className="page-heading"><div><span className="eyebrow">Almost there</span><h1>Checkout.</h1><p>Tell us where to bring the good stuff.</p></div></div><div className="checkout-layout"><form className="panel form-stack" onSubmit={submit}><label>Delivery address<textarea required rows="5" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Apartment, street, city" /></label>{error && <div className="form-error">{error}</div>}<button className="button button-accent button-wide" disabled={placing}>{placing ? 'Placing order…' : 'Place order · $' + (subtotal + 2.99).toFixed(2)}</button></form><aside className="order-summary panel"><span className="eyebrow">Order from</span><h3>{cart.partner?.business?.name || 'Local kitchen'}</h3>{items.map((item) => <div className="split-row summary-item" key={item.food?._id}><span>{item.quantity} × {item.food?.name}</span><strong>${(Number(item.food?.price || 0) * item.quantity).toFixed(2)}</strong></div>)}<hr /><div className="split-row"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div><div className="split-row"><span>Delivery</span><strong>$2.99</strong></div></aside></div></div>;
}
