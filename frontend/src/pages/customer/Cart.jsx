import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';

export default function Cart() {
  const { cart, updateItem, removeItem, clear, addItem } = useCart();
  const navigate = useNavigate();
  const [conflict, setConflict] = useState(null);
  const [error, setError] = useState('');
  const items = cart.items || [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.food?.price || 0) * item.quantity, 0);
  const fee = items.length ? 2.99 : 0;
  async function addFromFood(foodId) { try { await addItem(foodId); } catch (requestError) { if (requestError.response?.status === 409) setConflict(foodId); else setError(requestError.response?.data?.error?.message || 'Could not update the cart.'); } }
  return <div className="cart-page"><div className="page-heading"><div><span className="eyebrow">Your table</span><h1>Cart <small>({items.length})</small></h1><p>Everything from one kitchen, ready when you are.</p></div><Link className="button button-ghost" to="/explore">Keep exploring</Link></div>{error && <div className="form-error">{error}</div>}{!items.length ? <EmptyState title="Your cart is waiting" message="Find something delicious to get started." action={<Link className="button button-accent" to="/explore">Explore dishes</Link>} /> : <><div className="cart-layout"><div className="cart-items">{items.map((item) => <article className="cart-item" key={item.food?._id}><img src={item.food?.image} alt={item.food?.name} /><div><Link to={`/foods/${item.food?._id}`}><strong>{item.food?.name}</strong></Link><small>{cart.partner?.business?.name || 'Local kitchen'}</small><span>${Number(item.food?.price || 0).toFixed(2)} each</span></div><div className="quantity-control"><button onClick={() => item.quantity > 1 ? updateItem(item.food._id, item.quantity - 1) : removeItem(item.food._id)} aria-label="Decrease quantity">−</button><span>{item.quantity}</span><button onClick={() => updateItem(item.food._id, item.quantity + 1)} aria-label="Increase quantity">+</button></div></article>)}</div><aside className="order-summary panel"><div className="split-row"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div><div className="split-row"><span>Delivery</span><strong>${fee.toFixed(2)}</strong></div><hr /><div className="split-row total-row"><span>Total</span><strong>${(subtotal + fee).toFixed(2)}</strong></div><button className="button button-accent button-wide" onClick={() => navigate('/checkout')}>Continue to checkout</button><button className="text-button" onClick={clear}>Clear cart</button></aside></div></>}{conflict && <Modal open title="Switch kitchens?" onClose={() => setConflict(null)}><p className="muted">Your cart has items from another partner. Clear it and add this dish instead?</p><div className="modal-actions"><button className="button button-ghost" onClick={() => setConflict(null)}>Keep cart</button><button className="button button-accent" onClick={async () => { await clear(); await addFromFood(conflict); setConflict(null); }}>Clear and add</button></div></Modal>}</div>;
}
