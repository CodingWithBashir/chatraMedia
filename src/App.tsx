import { lazy, Suspense } from 'react';
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


const AuthPage = lazy(() => import('./pages/AuthPage'));
const AdminOverview = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminOverview })));
const AdminReports = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminReports })));
const AdminUsers = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminUsers })));
const AdminContent = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminContent })));
const AdminAudit = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminAudit })));
const AdminSettings = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminSettings })));
const AdminAnnouncements = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminAnnouncements })));
const SocialGraph = lazy(() => import('./pages/SocialGraph'));
const CallHistory = lazy(() => import('./pages/CallHistory'));
const TagHub = lazy(() => import('./pages/DiscoverExtras').then(m => ({ default: m.TagHub })));
const ListTimeline = lazy(() => import('./pages/DiscoverExtras').then(m => ({ default: m.ListTimeline })));
const DraftsPage = lazy(() => import('./pages/DiscoverExtras').then(m => ({ default: m.DraftsPage })));
const CreatorDashboard = lazy(() => import('./pages/DiscoverExtras').then(m => ({ default: m.CreatorDashboard })));
const AdvancedSearch = lazy(() => import('./pages/AdvancedSearch'));
const ProfileEditor = lazy(() => import('./pages/ProfileEditor'));
const ListsHub = lazy(() => import('./pages/ListsHub'));
const PostAnalytics = lazy(() => import('./pages/PostAnalytics'));
const StoryCreator = lazy(() => import('./pages/StoryCreator'));
const SupportTicket = lazy(() => import('./pages/SupportTicket'));
const ResetPassword = lazy(() => import('./pages/AuthFlows').then(m => ({ default: m.ResetPassword })));
const TwoFactorChallenge = lazy(() => import('./pages/AuthFlows').then(m => ({ default: m.TwoFactorChallenge })));
function PageLoading() { return <div className="panel page-loading" role="status">Opening this Chatra screen…</div>; }

function NotFound() {
  return <div className="panel not-found"><EmptyState icon={<Compass size={42} />} title="A little off the beaten path" description="This page doesn’t exist, but there’s a whole world of conversation back home."><Link to="/" className="button primary">Back to Chatra</Link></EmptyState></div>;
}
export default function App() {
  return <AppProvider><Suspense fallback={<PageLoading />}><Routes><Route element={<Layout />}><Route index element={<Home />} /><Route path="explore" element={<Explore />} /><Route path="notifications" element={<Notifications />} /><Route path="messages" element={<Messages />} /><Route path="messages/:id" element={<Messages />} /><Route path="communities" element={<Communities />} /><Route path="bookmarks" element={<Bookmarks />} /><Route path="profile" element={<Profile />} /><Route path="login" element={<AuthPage />} /><Route path="search" element={<AdvancedSearch />} /><Route path="stories/create" element={<StoryCreator />} /><Route path="reset-password" element={<ResetPassword />} /><Route path="two-factor-challenge" element={<TwoFactorChallenge />} /><Route path="support/:id" element={<SupportTicket />} /><Route path="profile/edit" element={<ProfileEditor />} /><Route path="profile/:id/followers" element={<SocialGraph />} /><Route path="profile/:id/following" element={<SocialGraph />} /><Route path="profile/:id" element={<Profile />} /><Route path="settings" element={<Settings />} /><Route path="personalize" element={<Personalize />} /><Route path="tag/:tag" element={<TagHub />} /><Route path="lists" element={<ListsHub />} /><Route path="lists/:id" element={<ListTimeline />} /><Route path="drafts" element={<DraftsPage />} /><Route path="creator" element={<CreatorDashboard />} /><Route path="creator/post/:id/analytics" element={<PostAnalytics />} /><Route path="calls" element={<CallHistory />} /><Route path="call/:id" element={<Call />} /><Route path="admin" element={<AdminOverview />} /><Route path="admin/reports" element={<AdminReports />} /><Route path="admin/users" element={<AdminUsers />} /><Route path="admin/content" element={<AdminContent />} /><Route path="admin/audit" element={<AdminAudit />} /><Route path="admin/settings" element={<AdminSettings />} /><Route path="admin/announcements" element={<AdminAnnouncements />} /><Route path="*" element={<NotFound />} /></Route></Routes></Suspense><GlobalModals /></AppProvider>;
}