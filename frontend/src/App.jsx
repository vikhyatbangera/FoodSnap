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
import PartnerFoods from './pages/partner/Foods';
import PartnerReels from './pages/partner/Reels';
import PartnerOrders from './pages/partner/Orders';
import PartnerReviews from './pages/partner/Reviews';
import PartnerBusinessProfile from './pages/partner/Profile';
import PartnerSettings from './pages/partner/Settings';

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
          <Route path="partner/foods" element={<PartnerFoods />} />
          <Route path="partner/reels/new" element={<PartnerReels />} />
          <Route path="partner/orders" element={<PartnerOrders />} />
          <Route path="partner/reviews" element={<PartnerReviews />} />
          <Route path="partner/profile" element={<PartnerBusinessProfile />} />
          <Route path="partner/settings" element={<PartnerSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
