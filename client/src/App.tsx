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

const MoreHubPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.MoreHubPage })));
const PeopleDirectoryPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.PeopleDirectoryPage })));
const EventsPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.EventsPage })));
const EventDetailPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.EventDetailPage })));
const MessageRequestsPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.MessageRequestsPage })));
const BookmarkCollectionsPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.BookmarkCollectionsPage })));
const NotificationPreferencesPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.NotificationPreferencesPage })));
const PrivacyCenterPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.PrivacyCenterPage })));
const SecurityCenterPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.SecurityCenterPage })));
const HelpCenterPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.HelpCenterPage })));
const ContactSupportPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.ContactSupportPage })));
const AboutPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.AboutPage })));
const TermsPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.TermsPage })));
const PrivacyPolicyPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.PrivacyPolicyPage })));
const AccessibilityPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.AccessibilityPage })));
const CreatorResourcesPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.CreatorResourcesPage })));
const InsightsPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.InsightsPage })));
const CommunityDirectoryPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.CommunityDirectoryPage })));
const CommunityDetailPage = lazy(() => import('./screens/MorePages').then(m => ({ default: m.CommunityDetailPage })));

function PageLoading() { return <div className="panel page-loading" role="status">Opening this Chatra screen…</div>; }

function NotFound() {
  return <div className="panel not-found"><EmptyState icon={<Compass size={42} />} title="A little off the beaten path" description="This page doesn’t exist, but there’s a whole world of conversation back home."><Link to="/" className="button primary">Back to Chatra</Link></EmptyState></div>;
}
export default function App() {
  return <AppProvider><Suspense fallback={<PageLoading />}><Routes><Route element={<Layout />}><Route index element={<Home />} /><Route path="explore" element={<Explore />} /><Route path="notifications" element={<Notifications />} /><Route path="messages" element={<Messages />} /><Route path="messages/:id" element={<Messages />} /><Route path="communities" element={<Communities />} /><Route path="bookmarks" element={<Bookmarks />} /><Route path="more" element={<MoreHubPage />} /><Route path="people" element={<PeopleDirectoryPage />} /><Route path="events" element={<EventsPage />} /><Route path="events/:id" element={<EventDetailPage />} /><Route path="message-requests" element={<MessageRequestsPage />} /><Route path="bookmarks/collections" element={<BookmarkCollectionsPage />} /><Route path="notifications/preferences" element={<NotificationPreferencesPage />} /><Route path="privacy" element={<PrivacyCenterPage />} /><Route path="security" element={<SecurityCenterPage />} /><Route path="help" element={<HelpCenterPage />} /><Route path="help/contact" element={<ContactSupportPage />} /><Route path="about" element={<AboutPage />} /><Route path="terms" element={<TermsPage />} /><Route path="privacy-policy" element={<PrivacyPolicyPage />} /><Route path="accessibility" element={<AccessibilityPage />} /><Route path="creator/resources" element={<CreatorResourcesPage />} /><Route path="insights" element={<InsightsPage />} /><Route path="community-directory" element={<CommunityDirectoryPage />} /><Route path="community/:id" element={<CommunityDetailPage />} /><Route path="profile" element={<Profile />} /><Route path="login" element={<AuthPage />} /><Route path="search" element={<AdvancedSearch />} /><Route path="stories/create" element={<StoryCreator />} /><Route path="reset-password" element={<ResetPassword />} /><Route path="two-factor-challenge" element={<TwoFactorChallenge />} /><Route path="support/:id" element={<SupportTicket />} /><Route path="profile/edit" element={<ProfileEditor />} /><Route path="profile/:id/followers" element={<SocialGraph />} /><Route path="profile/:id/following" element={<SocialGraph />} /><Route path="profile/:id" element={<Profile />} /><Route path="settings" element={<Settings />} /><Route path="personalize" element={<Personalize />} /><Route path="tag/:tag" element={<TagHub />} /><Route path="lists" element={<ListsHub />} /><Route path="lists/:id" element={<ListTimeline />} /><Route path="drafts" element={<DraftsPage />} /><Route path="creator" element={<CreatorDashboard />} /><Route path="creator/post/:id/analytics" element={<PostAnalytics />} /><Route path="calls" element={<CallHistory />} /><Route path="call/:id" element={<Call />} /><Route path="admin" element={<AdminOverview />} /><Route path="admin/reports" element={<AdminReports />} /><Route path="admin/users" element={<AdminUsers />} /><Route path="admin/content" element={<AdminContent />} /><Route path="admin/audit" element={<AdminAudit />} /><Route path="admin/settings" element={<AdminSettings />} /><Route path="admin/announcements" element={<AdminAnnouncements />} /><Route path="*" element={<NotFound />} /></Route></Routes></Suspense><GlobalModals /></AppProvider>;
}