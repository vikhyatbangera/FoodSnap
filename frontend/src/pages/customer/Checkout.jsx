import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ordersApi from '../../api/orders';
import { useCart } from '../../context/CartContext';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const items = cart.items || [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.food?.price || 0) * item.quantity, 0);
  
  if (!items.length) return <EmptyState title="Nothing to check out" action={<button className="button button-accent" onClick={() => navigate('/explore')}>Find a dish</button>} />;
  
  async function submit(event) {
    event.preventDefault(); 
    setError(''); 
    setPlacing(true);
    
    try {
      // 1. Create a Razorpay Order
      const paymentOrder = await ordersApi.createPaymentOrder();
      
      // Simulating a successful Razorpay payment for demo purposes
      setTimeout(async () => {
        try {
          const payload = {
            address,
            razorpay_payment_id: 'pay_demo_' + Date.now(),
            razorpay_order_id: paymentOrder.orderId,
            razorpay_signature: 'demo_signature' // Bypassed on backend
          };
          const { order } = await ordersApi.placeOrder(payload);
          await clear();
          toast.success('Payment successfully captured! (Demo Mode)');
          navigate(`/orders/${order._id}`);
        } catch (err) {
          setError(err.response?.data?.error?.message || 'Order creation failed.');
          setPlacing(false);
        }
      }, 1500);
      
    } catch (requestError) { 
      setError(requestError.response?.data?.error?.message || 'We could not initiate payment.'); 
      setPlacing(false); 
    }
  }
  
  return <div className="checkout-page"><div className="page-heading"><div><span className="eyebrow">Almost there</span><h1>Checkout.</h1><p>Tell us where to bring the good stuff.</p></div></div><div className="checkout-layout"><form className="panel form-stack" onSubmit={submit}><label>Delivery address<textarea required rows="5" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Apartment, street, city" /></label>{error && <div className="form-error">{error}</div>}<button className="button button-accent button-wide" disabled={placing}>{placing ? 'Processing…' : 'Pay $' + (subtotal + 2.99).toFixed(2)}</button></form><aside className="order-summary panel"><span className="eyebrow">Order from</span><h3>{cart.partner?.business?.name || 'Local kitchen'}</h3>{items.map((item) => <div className="split-row summary-item" key={item.food?._id}><span>{item.quantity} × {item.food?.name}</span><strong>${(Number(item.food?.price || 0) * item.quantity).toFixed(2)}</strong></div>)}<hr /><div className="split-row"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div><div className="split-row"><span>Delivery</span><strong>$2.99</strong></div></aside></div></div>;
}
