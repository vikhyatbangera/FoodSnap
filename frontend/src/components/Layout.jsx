import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import ChatWidget from './ChatWidget';

export default function Layout() {
  return <div className="app-shell"><Navbar /><main className="page-shell"><Outlet /></main><BottomNav /><ChatWidget /></div>;
}
