import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Search, ArrowUpRight, Users, CalendarDays, MapPin } from 'lucide-react';
import { people, trends, meetupDate } from '../data';
import { useApp } from '../store';
import { Avatar, SearchInput, Menu } from './UI';
import { RightFooter } from './Layout';

export function FollowButton({ id, small = false }: { id: string; small?: boolean }) {
  const { followed, toggleFollow } = useApp();
  const following = followed.includes(id);
  return <button className={`button ${following ? 'secondary following-button' : 'primary'} ${small ? 'small' : ''}`} onClick={() => toggleFollow(id)} aria-pressed={following}>{following ? 'Following' : 'Follow'}</button>;
}
export function TrendsCard({ limit = 4 }: { limit?: number }) {
  const { openModal } = useApp();
  const navigate = useNavigate();
  return <section className="panel trends-card"><h2>Trends for you</h2>{trends.slice(0, limit).map(trend => <div className="trend-row" key={trend.tag}><Link to={`/explore?q=${encodeURIComponent('#' + trend.tag)}`}><strong>#{trend.tag}</strong><span>{trend.count} posts</span></Link><Menu label={`Options for ${trend.tag}`} items={[{ label: 'Explore this topic', icon: <ArrowUpRight size={16} />, onClick: () => navigate(`/explore?q=${encodeURIComponent('#' + trend.tag)}`) }, { label: 'Not interested in this topic', onClick: () => openModal('feedback', { topic: trend.tag }) }]}><MoreHorizontal size={18} /></Menu></div>)}</section>;
}
export function SuggestionsCard({ limit = 2 }: { limit?: number }) {
  const { followed } = useApp();
  const suggestions = people.filter(p => p.id !== 'bashir' && !followed.includes(p.id)).slice(0, limit);
  const shown = suggestions.length ? suggestions : people.filter(p => p.id !== 'bashir').slice(0, limit);
  return <section className="panel suggestions-card"><div className="card-heading"><h2>People you may know</h2><Link to="/explore?tab=people" className="text-link">See all</Link></div>{shown.map(person => <div className="suggestion-row" key={person.id}><Link to={`/profile/${person.id}`}><Avatar src={person.avatar} alt={person.name} size={48} /></Link><div className="suggestion-info"><Link to={`/profile/${person.id}`}><strong>{person.name}</strong><span>@{person.handle}</span></Link><p>{person.role} <span>·</span> {person.location.split(',')[0]}</p></div><FollowButton id={person.id} small /></div>)}</section>;
}
export function CommunitySpotlight() {
  const { communities, toggleJoin, openModal } = useApp();
  return <section className="panel community-spotlight"><div className="card-heading"><h2>Find your people</h2><Users size={19} /></div><div className="spotlight-icon"><Users size={27} /></div><h3>Kigali Developers</h3><p>A space to build, learn, and grow with developers in Rwanda.</p><span className="spotlight-members"><Avatar src="/images/bashir-profile.webp" size={23} /><Avatar src="/images/amina.webp" size={23} /><Avatar src="/images/david.webp" size={23} /><span>2.4K members</span></span><div className="spotlight-actions"><Link to="/communities" className="button secondary small">Explore community</Link><button className="text-link" onClick={() => communities.find(c => c.id === 'kigali-devs')?.joined ? openModal('event') : toggleJoin('kigali-devs')}>{communities.find(c => c.id === 'kigali-devs')?.joined ? 'Next meetup' : 'Join'}</button></div></section>;
}
export function MeetupCard() {
  const { openModal } = useApp();
  return <section className="panel meetup-card"><button className="card-heading meetup-heading" onClick={() => openModal('event')}><span><CalendarDays size={20} />Upcoming meetup</span><ArrowUpRight size={18} /></button><button className="meetup-image" onClick={() => openModal('event')} aria-label="View Kigali Dev Meetup"><img src="/images/meetup.webp" alt="Developers gathered at a community meetup" /></button><h3>Kigali Dev Meetup</h3><p><CalendarDays size={15} />{meetupDate} · 4 PM – 7 PM</p><p><MapPin size={15} />Kigali, Rwanda</p><div className="meetup-bottom"><span className="avatar-stack"><Avatar src="/images/bashir-profile.webp" size={25} /><Avatar src="/images/amina.webp" size={25} /><Avatar src="/images/david.webp" size={25} /><Avatar src="/images/grace.webp" size={25} /></span><span>183 going</span><button className="button primary small" onClick={() => openModal('event')}>View details</button></div></section>;
}
export default function Rail({ search = true, community = false }: { search?: boolean; community?: boolean }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  return <aside className="right-rail">{search && <SearchInput value={query} onChange={setQuery} placeholder="Search Chatra" onKeyDown={e => { if (e.key === 'Enter' && query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`); }} />}<TrendsCard /><SuggestionsCard />{community ? <MeetupCard /> : <CommunitySpotlight />}<RightFooter /></aside>;
}
export function ExplorePrompt() {
  return <Link to="/explore" className="explore-prompt"><Search size={18} /><span>A whole world of conversations.</span><ArrowUpRight size={17} /></Link>;
}