import { lazy, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { AppProvider } from './store';
import Layout from './components/Layout';
import GlobalModals from './components/Modals';
import { EmptyState } from './components/UI';
import Home, { Explore, Bookmarks, Notifications } from './screens/Home';
import Profile from './screens/Profile';
import Messages from './screens/Messages';
import Call from './screens/Call';
import Communities from './screens/Communities';
import Settings from './screens/Settings';
import Personalize from './screens/Personalize';


const AuthPage = lazy(() => import('./screens/AuthPage'));
const AdminOverview = lazy(() => import('./screens/Admin').then(m => ({ default: m.AdminOverview })));
const AdminReports = lazy(() => import('./screens/Admin').then(m => ({ default: m.AdminReports })));
const AdminUsers = lazy(() => import('./screens/Admin').then(m => ({ default: m.AdminUsers })));
const AdminContent = lazy(() => import('./screens/Admin').then(m => ({ default: m.AdminContent })));
const AdminAudit = lazy(() => import('./screens/Admin').then(m => ({ default: m.AdminAudit })));
const AdminSettings = lazy(() => import('./screens/Admin').then(m => ({ default: m.AdminSettings })));
const AdminAnnouncements = lazy(() => import('./screens/Admin').then(m => ({ default: m.AdminAnnouncements })));
const SocialGraph = lazy(() => import('./screens/SocialGraph'));
const CallHistory = lazy(() => import('./screens/CallHistory'));
const TagHub = lazy(() => import('./screens/DiscoverExtras').then(m => ({ default: m.TagHub })));
const ListTimeline = lazy(() => import('./screens/DiscoverExtras').then(m => ({ default: m.ListTimeline })));
const DraftsPage = lazy(() => import('./screens/DiscoverExtras').then(m => ({ default: m.DraftsPage })));
const CreatorDashboard = lazy(() => import('./screens/DiscoverExtras').then(m => ({ default: m.CreatorDashboard })));
const AdvancedSearch = lazy(() => import('./screens/AdvancedSearch'));
const ProfileEditor = lazy(() => import('./screens/ProfileEditor'));
const ListsHub = lazy(() => import('./screens/ListsHub'));
const PostAnalytics = lazy(() => import('./screens/PostAnalytics'));
const StoryCreator = lazy(() => import('./screens/StoryCreator'));
const SupportTicket = lazy(() => import('./screens/SupportTicket'));
const ResetPassword = lazy(() => import('./screens/AuthFlows').then(m => ({ default: m.ResetPassword })));
const TwoFactorChallenge = lazy(() => import('./screens/AuthFlows').then(m => ({ default: m.TwoFactorChallenge })));
function PageLoading() { return <div className="panel page-loading" role="status">Opening this Chatra screen…</div>; }

function NotFound() {
  return <div className="panel not-found"><EmptyState icon={<Compass size={42} />} title="A little off the beaten path" description="This page doesn’t exist, but there’s a whole world of conversation back home."><Link to="/" className="button primary">Back to Chatra</Link></EmptyState></div>;
}
export default function App() {
  return <AppProvider><Suspense fallback={<PageLoading />}><Routes><Route element={<Layout />}><Route index element={<Home />} /><Route path="explore" element={<Explore />} /><Route path="notifications" element={<Notifications />} /><Route path="messages" element={<Messages />} /><Route path="messages/:id" element={<Messages />} /><Route path="communities" element={<Communities />} /><Route path="bookmarks" element={<Bookmarks />} /><Route path="profile" element={<Profile />} /><Route path="login" element={<AuthPage />} /><Route path="search" element={<AdvancedSearch />} /><Route path="stories/create" element={<StoryCreator />} /><Route path="reset-password" element={<ResetPassword />} /><Route path="two-factor-challenge" element={<TwoFactorChallenge />} /><Route path="support/:id" element={<SupportTicket />} /><Route path="profile/edit" element={<ProfileEditor />} /><Route path="profile/:id/followers" element={<SocialGraph />} /><Route path="profile/:id/following" element={<SocialGraph />} /><Route path="profile/:id" element={<Profile />} /><Route path="settings" element={<Settings />} /><Route path="personalize" element={<Personalize />} /><Route path="tag/:tag" element={<TagHub />} /><Route path="lists" element={<ListsHub />} /><Route path="lists/:id" element={<ListTimeline />} /><Route path="drafts" element={<DraftsPage />} /><Route path="creator" element={<CreatorDashboard />} /><Route path="creator/post/:id/analytics" element={<PostAnalytics />} /><Route path="calls" element={<CallHistory />} /><Route path="call/:id" element={<Call />} /><Route path="admin" element={<AdminOverview />} /><Route path="admin/reports" element={<AdminReports />} /><Route path="admin/users" element={<AdminUsers />} /><Route path="admin/content" element={<AdminContent />} /><Route path="admin/audit" element={<AdminAudit />} /><Route path="admin/settings" element={<AdminSettings />} /><Route path="admin/announcements" element={<AdminAnnouncements />} /><Route path="*" element={<NotFound />} /></Route></Routes></Suspense><GlobalModals /></AppProvider>;
}