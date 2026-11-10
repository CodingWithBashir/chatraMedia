import { useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { House, Search, Compass, Bell, MessageCircle, Users, Bookmark, UserRound, Settings, Plus, MoreHorizontal, ChevronRight, Sparkles, Check, ArrowUpRight, Activity, Flag, FileText, ShieldCheck, PhoneCall, List, BarChart3, LifeBuoy, LogIn, LogOut } from 'lucide-react';
import { useApp } from '../store';
import { Avatar, Logo, Menu, IconButton } from './UI';

export const navItems = [
  { to: '/', label: 'Home', icon: House },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/communities', label: 'Communities', icon: Users },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/settings', label: 'Settings', icon: Settings },
];
function AccountMenu() {
  const { openModal, session, signOut } = useApp();
  const navigate = useNavigate();
  return <Menu label="Account options" items={[{ label: session ? 'Sign out' : 'Sign in / create account', icon: session ? <LogOut size={17} /> : <LogIn size={17} />, onClick: () => session ? void signOut() : navigate('/login') },

    { label: 'View your profile', icon: <UserRound size={17} />, onClick: () => navigate('/profile') },
    { label: 'Personalize your experience', icon: <Sparkles size={17} />, onClick: () => navigate('/personalize') },
    { label: 'Creator dashboard', icon: <BarChart3 size={17} />, onClick: () => navigate('/creator') },
    { label: 'Drafts & scheduled', icon: <FileText size={17} />, onClick: () => navigate('/drafts') },
    { label: 'My lists', icon: <List size={17} />, onClick: () => navigate('/lists') },
    { label: 'Call history', icon: <PhoneCall size={17} />, onClick: () => navigate('/calls') },
    { label: 'Support request', icon: <LifeBuoy size={17} />, onClick: () => navigate('/support/CH-1024') },
    { label: 'Settings and privacy', icon: <Settings size={17} />, onClick: () => navigate('/settings') },
    { label: 'About this prototype', icon: <ArrowUpRight size={17} />, onClick: () => openModal('about') },
  ]}><MoreHorizontal size={20} /></Menu>;
}
function Sidebar() {
  const { profile, notifications, threads, openModal } = useApp();
  const unread = notifications.filter(n => !n.read).length;
  const messages = threads.reduce((n, t) => n + t.unread, 0);
  return <aside className="sidebar"><Link to="/" aria-label="Chatra home" className="sidebar-logo"><Logo /></Link><nav aria-label="Main navigation" className="desktop-nav">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon"><Icon size={23} strokeWidth={1.65} />{label === 'Notifications' && unread > 0 && <span className="nav-badge">{unread}</span>}{label === 'Messages' && messages > 0 && <span className="nav-dot" />}</span><span className="nav-label">{label}</span></NavLink>)}</nav><div className="admin-nav-section"><span>Admin · demo</span>{[{ to: '/admin', label: 'Overview', icon: Activity }, { to: '/admin/reports', label: 'Reports', icon: Flag }, { to: '/admin/users', label: 'Users', icon: Users }, { to: '/admin/content', label: 'Content', icon: FileText }, { to: '/admin/audit', label: 'Moderation log', icon: ShieldCheck }, { to: '/admin/announcements', label: 'Announcements', icon: Bell }, { to: '/admin/settings', label: 'Admin settings', icon: Settings }].map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => `nav-item admin-nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon"><Icon size={20}/></span><span className="nav-label">{label}</span>{label === 'Reports' && <span className="admin-report-count">24</span>}</NavLink>)}</div><button className="button primary sidebar-compose" onClick={() => openModal('compose')}><Plus size={21} /><span>Create post</span></button><div className="sidebar-account"><Avatar src={profile.avatar} alt={profile.name} size={42} online /><Link to="/profile" className="account-names"><strong>{profile.name}</strong><span>@{profile.handle}</span></Link><AccountMenu /></div></aside>;
}
function MobileHeader() {
  const { threads, openModal } = useApp();
  const navigate = useNavigate();
  const messages = threads.reduce((n, t) => n + t.unread, 0);
  return <header className="mobile-header"><Link to="/" aria-label="Chatra home"><Logo /></Link><div><IconButton label="Search Chatra" onClick={() => navigate('/search')}><Search size={24} /></IconButton><IconButton label="Open messages" className="mobile-message-icon" onClick={() => navigate('/messages')}><MessageCircle size={25} />{messages > 0 && <span className="nav-badge">{messages}</span>}</IconButton><IconButton label="Account options" className="mobile-account" onClick={() => openModal('account')}><UserRound size={23} /></IconButton></div></header>;
}
function MobileNav() {
  const { notifications } = useApp();
  const unread = notifications.some(n => !n.read);
  const items = [navItems[0], { ...navItems[1], to: '/search', label: 'Search', icon: Search }, navItems[4], navItems[2], navItems[6]];
  return <nav className="mobile-nav" aria-label="Mobile navigation">{items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}><span><Icon size={24} strokeWidth={1.7} />{label === 'Notifications' && unread && <i className="mobile-notification-dot" />}</span><span>{label}</span></NavLink>)}</nav>;
}
export default function Layout() {
  const location = useLocation();
  const { toast, openModal } = useApp();
  const isConversation = /^\/messages\/.+/.test(location.pathname);
  const isCall = location.pathname.startsWith('/call');
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]);
  const title = navItems.find(n => n.to === location.pathname)?.label || (location.pathname.startsWith('/profile') ? 'Profile' : location.pathname.startsWith('/messages') ? 'Messages' : isCall ? 'Video call' : location.pathname === '/personalize' ? 'Personalize your experience' : location.pathname.startsWith('/admin') ? 'Admin' : location.pathname === '/calls' ? 'Call history' : location.pathname.startsWith('/creator/post/') ? 'Post analytics' : location.pathname === '/creator' ? 'Creator dashboard' : location.pathname === '/drafts' ? 'Drafts & scheduled' : location.pathname === '/login' ? 'Sign in' : location.pathname === '/search' ? 'Search' : location.pathname === '/stories/create' ? 'Create a story' : location.pathname.startsWith('/support/') ? 'Support' : location.pathname === '/reset-password' ? 'Reset password' : location.pathname === '/two-factor-challenge' ? 'Two-factor verification' : location.pathname === '/profile/edit' ? 'Edit profile' : location.pathname.startsWith('/tag/') ? `#${location.pathname.split('/').pop()}` : location.pathname.startsWith('/lists') ? 'My lists' : 'Home');
  useEffect(() => { document.title = `${title} · Chatra`; }, [title]);
  return <div className={`app-shell ${isConversation ? 'in-conversation' : ''} ${isCall ? 'in-call' : ''}`}><a href="#main-content" className="skip-link">Skip to content</a><Sidebar /><MobileHeader /><main id="main-content" className={`main-content route-${location.pathname.split('/')[1] || 'home'}`}><Outlet /></main>{!isCall && !isConversation && <button className="mobile-fab" aria-label="Create post" onClick={() => openModal('compose')}><Plus size={29} /></button>}<MobileNav />{toast && <div className="toast" role="status"><span><Check size={17} /></span>{toast}</div>}</div>;
}
export function RightFooter() {
  const { openModal } = useApp();
  return <footer className="right-footer"><div><button onClick={() => openModal('about')}>About Chatra</button><span>·</span><button onClick={() => openModal('help', { section: 'privacy' })}>Privacy</button><span>·</span><button onClick={() => openModal('help')}>Help</button></div><p>© 2026 Chatra. Made for connection.</p><Link to="/personalize"><Sparkles size={13} /> Make Chatra yours <ChevronRight size={13} /></Link></footer>;
}