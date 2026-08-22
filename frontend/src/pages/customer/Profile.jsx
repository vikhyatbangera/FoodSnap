import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mediaUrl } from '../../utils/media';

export default function Profile() {
  const { user } = useAuth();
  return <div className="profile-page"><div className="profile-hero"><div className="profile-avatar">{user?.photo ? <img src={mediaUrl(user.photo)} alt={user.name} /> : user?.name?.charAt(0)}</div><div><span className="eyebrow">Your FoodSnap</span><h1>{user?.name}</h1><p>{user?.email}</p></div></div><div className="profile-links"><Link to="/settings"><span>⚙</span><div><strong>Settings</strong><small>Theme, notifications, and your details</small></div>→</Link><Link to="/saved"><span>▱</span><div><strong>Saved</strong><small>Your favourite dishes and reels</small></div>→</Link><Link to="/orders"><span>▣</span><div><strong>Orders</strong><small>Track your food story</small></div>→</Link></div></div>;
}
