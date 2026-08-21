import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/customer/Home';
import Dashboard from './pages/partner/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';

function CustomerPlaceholder({ title }) {
  return <PlaceholderPage title={title} eyebrow="Customer space" />;
}

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
          <Route path="reels" element={<CustomerPlaceholder title="A new way to taste the city." />} />
          <Route path="explore" element={<CustomerPlaceholder title="Explore your next craving." />} />
          <Route path="foods/:id" element={<CustomerPlaceholder title="A closer look at something delicious." />} />
          <Route path="partners/:id" element={<CustomerPlaceholder title="Meet the kitchen behind the plate." />} />
          <Route path="cart" element={<CustomerPlaceholder title="Your table, almost ready." />} />
          <Route path="checkout" element={<CustomerPlaceholder title="A few final details." />} />
          <Route path="orders" element={<CustomerPlaceholder title="Your food story so far." />} />
          <Route path="orders/:id" element={<CustomerPlaceholder title="Order details." />} />
          <Route path="saved" element={<CustomerPlaceholder title="The good stuff you saved." />} />
          <Route path="profile" element={<CustomerPlaceholder title="Your FoodSnap profile." />} />
          <Route path="settings" element={<CustomerPlaceholder title="Make FoodSnap yours." />} />
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
