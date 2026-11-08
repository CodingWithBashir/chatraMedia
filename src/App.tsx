import { Routes, Route, Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { AppProvider } from './store';
import Layout from './components/Layout';
import GlobalModals from './components/Modals';
import { EmptyState } from './components/UI';
import Home, { Explore, Bookmarks, Notifications } from './pages/Home';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Call from './pages/Call';
import Communities from './pages/Communities';
import Settings from './pages/Settings';
import Personalize from './pages/Personalize';

function NotFound() {
  return <div className="panel not-found"><EmptyState icon={<Compass size={42} />} title="A little off the beaten path" description="This page doesn’t exist, but there’s a whole world of conversation back home."><Link to="/" className="button primary">Back to Chatra</Link></EmptyState></div>;
}
export default function App() {
  return <AppProvider><Routes><Route element={<Layout />}><Route index element={<Home />} /><Route path="explore" element={<Explore />} /><Route path="notifications" element={<Notifications />} /><Route path="messages" element={<Messages />} /><Route path="messages/:id" element={<Messages />} /><Route path="communities" element={<Communities />} /><Route path="bookmarks" element={<Bookmarks />} /><Route path="profile" element={<Profile />} /><Route path="profile/:id" element={<Profile />} /><Route path="settings" element={<Settings />} /><Route path="personalize" element={<Personalize />} /><Route path="call/:id" element={<Call />} /><Route path="*" element={<NotFound />} /></Route></Routes><GlobalModals /></AppProvider>;
}