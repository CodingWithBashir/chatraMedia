import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Sparkles, Heart, UserPlus, MessageCircle, Repeat2, Users, CheckCheck, Bookmark, Search, ArrowUpRight, Hash, Compass } from 'lucide-react';
import { useApp } from '../store';
import { people, trends, getPerson } from '../data';
import { Avatar, Tabs, EmptyState, PageHeading, SearchInput } from '../components/UI';
import { PostCard, Composer } from '../components/Post';
import Rail, { FollowButton } from '../components/Rail';

export default function Home() {
  const { posts, profile, followed, userStory, openModal } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('foryou');
  const [params] = useSearchParams();
  useEffect(() => { const id = params.get('post'); if (id && posts.some(p => p.id === id)) openModal('post', { id }); }, [params]);
  const feed = posts.filter(p => p.id !== 'p-pinned' && !p.communityId && (tab === 'foryou' || p.authorId === 'bashir' || followed.includes(p.authorId)));
  return <div className="feed-layout"><div className="feed-column"><PageHeading title="Home" description="A little closer to your people."><span className="feed-spark"><Sparkles size={17} />Your daily spark</span></PageHeading><Tabs items={[{ id: 'foryou', label: 'For you' }, { id: 'following', label: 'Following' }]} value={tab} onChange={setTab} className="feed-tabs" /><div className="stories" aria-label="Stories"><button className="story-item your-story" onClick={() => userStory ? openModal('story', { id: 'bashir' }) : navigate('/stories/create')}><span className="story-avatar-wrap"><Avatar src={userStory?.image || profile.avatar} alt="Your story" size={68} ring={userStory ? 'var(--accent)' : undefined} /><span className="story-plus"><Plus size={16} strokeWidth={2.5} /></span></span><span>{userStory ? 'Your story' : 'Add story'}</span></button>{people.slice(1).map((person, i) => <button className="story-item" key={person.id} onClick={() => openModal('story', { id: person.id })}><Avatar src={person.avatar} alt={`${person.name}'s story`} size={68} ring={['#dc70ba', '#48a5ed', '#e9c668', '#48d9b8'][i]} /><span>{person.name}</span></button>)}</div><Composer /> <div className="feed-posts">{feed.map(post => <PostCard key={post.id} post={post} />)}</div><div className="feed-end"><span className="mini-brand">✦</span><p>You’re all caught up.</p><span>Good conversations are worth a pause.</span><Link to="/explore" className="text-link">Find something new <ArrowUpRight size={15} /></Link></div></div><Rail /></div>;
}

export function Explore() {
  const { posts, communities, openModal } = useApp();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const tab = ['top', 'people', 'communities'].includes(params.get('tab') || '') ? params.get('tab')! : 'top';
  const setQuery = (q: string) => setParams(prev => { if (q) prev.set('q', q); else prev.delete('q'); return prev; }, { replace: true });
  const normalized = query.toLowerCase().replace(/^#/, '');
  const matchedPosts = posts.filter(p => p.id !== 'p-pinned' && !p.communityId && (!normalized || `${p.text} ${getPerson(p.authorId).name} ${p.tags.join(' ')}`.toLowerCase().includes(normalized)));
  const matchedPeople = people.filter(p => p.id !== 'bashir' && (!normalized || `${p.name} ${p.handle} ${p.role} ${p.location}`.toLowerCase().includes(normalized)));
  const matchedCommunities = communities.filter(c => !normalized || `${c.name} ${c.description} ${c.category}`.toLowerCase().includes(normalized));
  return <div className="explore-page"><PageHeading title="Explore" description="Follow your curiosity. Find your next conversation." /><SearchInput className="explore-search" value={query} onChange={setQuery} placeholder="Search people, posts, and communities" /><div className="topic-chips">{trends.map(t => <button key={t.tag} className={`chip ${normalized === t.tag.toLowerCase() ? 'active' : ''}`} onClick={() => setQuery(query === `#${t.tag}` ? '' : `#${t.tag}`)}><Hash size={14} />{t.tag}<span>{t.count}</span></button>)}</div><Tabs items={[{ id: 'top', label: 'For you' }, { id: 'people', label: 'People' }, { id: 'communities', label: 'Communities' }]} value={tab} onChange={id => setParams(prev => { prev.set('tab', id); return prev; })} />{query && <p className="results-label">{tab === 'people' ? matchedPeople.length : tab === 'communities' ? matchedCommunities.length : matchedPosts.length} results for <strong>{query}</strong></p>}
    {tab === 'top' && <div className="explore-content">{!query && <div className="explore-banner"><div><span className="eyebrow">MADE FOR MEANINGFUL CONNECTIONS</span><h2>Big ideas.<br />Even better people.</h2><p>Discover the creators and communities shaping what’s next across Africa and beyond.</p><button className="button primary" onClick={() => setParams({ tab: 'communities' })}>Find your community <ArrowUpRight size={17} /></button></div><div className="explore-banner-art"><Compass size={145} strokeWidth={0.7} /><span className="orbit orbit-one"><Avatar src="/images/amina.webp" size={54} /></span><span className="orbit orbit-two"><Avatar src="/images/david.webp" size={48} /></span><span className="orbit orbit-three"><Avatar src="/images/grace.webp" size={44} /></span></div></div>}<div className="explore-grid">{matchedPosts.map(post => <PostCard post={post} key={post.id} />)}</div>{matchedPosts.length === 0 && <EmptyState title="No conversations found" description="Try a different keyword, name, or topic."><button className="button secondary" onClick={() => setQuery('')}>Clear search</button></EmptyState>}</div>}
    {tab === 'people' && <div className="people-grid">{matchedPeople.map(person => <article className="panel person-card" key={person.id}><Link to={`/profile/${person.id}`}><Avatar src={person.avatar} alt={person.name} size={78} online={person.online} /><h2>{person.name}</h2><span className="muted">@{person.handle}</span></Link><span className="person-role">{person.role} · {person.location.split(',')[0]}</span><p>{person.bio}</p><div><FollowButton id={person.id} /><button className="button secondary" onClick={() => openModal('new-message', { personId: person.id })}>Message</button></div></article>)}{matchedPeople.length === 0 && <EmptyState title="No people found" description="Try searching by name, username, or location." />}</div>}
    {tab === 'communities' && <div className="community-directory">{matchedCommunities.map(community => <Link to={`/communities?community=${community.id}`} className="panel directory-card" key={community.id}><span className="directory-icon" style={{ color: community.color, background: `${community.color}12` }}><Users size={29} /></span><div><span className="eyebrow">{community.category}</span><h2>{community.name}</h2><p>{community.description}</p><span className="muted">{community.members} members {community.joined && '· Joined'}</span></div><ArrowUpRight size={22} /></Link>)}{matchedCommunities.length === 0 && <EmptyState title="No communities found" description="Try a broader topic, like technology or photography." />}</div>}
  </div>;
}

export function Bookmarks() {
  const { posts } = useApp();
  const [query, setQuery] = useState('');
  const saved = posts.filter(p => p.bookmarked && `${p.text} ${getPerson(p.authorId).name}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="bookmarks-page"><PageHeading title="Bookmarks" description="The ideas, moments, and conversations you want to come back to." /><div className="bookmarks-toolbar"><SearchInput value={query} onChange={setQuery} placeholder="Search your bookmarks" /><span className="muted">{saved.length} saved posts</span></div><div className="narrow-feed">{saved.map(post => <PostCard post={post} key={post.id} />)}{saved.length === 0 && <div className="panel"><EmptyState icon={<Bookmark size={34} />} title={query ? 'No saved posts match' : 'A home for your good finds'} description={query ? 'Try another keyword.' : 'Tap the bookmark icon on any post to keep it here for later.'}><Link className="button primary" to="/">Explore your feed</Link></EmptyState></div>}</div></div>;
}

export function Notifications() {
  const { notifications, setNotifications, profile, openModal } = useApp();
  const [tab, setTab] = useState('all');
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;
  const shown = notifications.filter(n => tab === 'all' || !n.read);
  const icons = { like: Heart, follow: UserPlus, comment: MessageCircle, repost: Repeat2, community: Users };
  const openNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id)!;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (notification.kind === 'follow') navigate(`/profile/${notification.personId}`);
    else if (notification.kind === 'community') navigate('/communities');
    else if (notification.postId) openModal('post', { id: notification.postId });
  };
  return <div className="notifications-page"><PageHeading title="Notifications" description="A little love from your corner of the internet."><button className="button secondary small" disabled={!unread} onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}><CheckCheck size={17} />Mark all as read</button></PageHeading><Tabs items={[{ id: 'all', label: 'All activity' }, { id: 'unread', label: 'Unread', count: unread }]} value={tab} onChange={setTab} /><div className="panel notification-list">{shown.map(notification => { const person = getPerson(notification.personId); const Icon = icons[notification.kind]; return <button key={notification.id} className={`notification-row ${!notification.read ? 'unread' : ''}`} onClick={() => openNotification(notification.id)}><span className={`notification-kind kind-${notification.kind}`}><Icon size={18} fill={notification.kind === 'like' ? 'currentColor' : 'none'} /></span><Avatar src={person.avatar} alt={person.name} size={45} /><span className="notification-content"><span><strong>{person.name}</strong> {notification.text}</span><time>{notification.time}</time></span>{!notification.read && <span className="unread-dot" />}</button>; })}{shown.length === 0 && <EmptyState icon={<CheckCheck size={35} />} title="All caught up!" description="New likes, comments, and connections will show up here." />}</div><div className="notification-note"><Avatar src={profile.avatar} size={30} /><p>You’re building something good. Keep sharing, {profile.name}.</p><Search size={16} /></div></div>;
}