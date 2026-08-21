import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/customer/Home';
import Reels from './pages/customer/Reels';
import Explore from './pages/customer/Explore';
import FoodDetail from './pages/customer/FoodDetail';
import PartnerProfile from './pages/customer/PartnerProfile';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import OrderDetail from './pages/customer/OrderDetail';
import Saved from './pages/customer/Saved';
import Profile from './pages/customer/Profile';
import Settings from './pages/customer/Settings';
import Dashboard from './pages/partner/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';

function PartnerPlaceholder({ title }) {
  return <PlaceholderPage title={title} eyebrow="Partner space" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute role="customer" />}>
          <Route index element={<Home />} />
          <Route path="reels" element={<Reels />} />
          <Route path="explore" element={<Explore />} />
          <Route path="foods/:id" element={<FoodDetail />} />
          <Route path="partners/:id" element={<PartnerProfile />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="saved" element={<Saved />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route element={<ProtectedRoute role="partner" />}>
          <Route path="partner" element={<Dashboard />} />
          <Route path="partner/foods" element={<PartnerPlaceholder title="Your menu, your signature." />} />
          <Route path="partner/reels/new" element={<PartnerPlaceholder title="Share the story behind the dish." />} />
          <Route path="partner/orders" element={<PartnerPlaceholder title="Keep every order moving." />} />
          <Route path="partner/reviews" element={<PartnerPlaceholder title="Listen to your diners." />} />
          <Route path="partner/profile" element={<PartnerPlaceholder title="Your kitchen’s profile." />} />
          <Route path="partner/settings" element={<PartnerPlaceholder title="Kitchen settings." />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
