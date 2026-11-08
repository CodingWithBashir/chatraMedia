import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pencil, MapPin, CalendarDays, Link as LinkIcon, Pin, Check, Circle, MessageCircle, Image as ImageIcon, Heart, UserRound } from 'lucide-react';
import { useApp } from '../store';
import { getPerson } from '../data';
import { Avatar, CoverArt, Tabs, EmptyState } from '../components/UI';
import { PostCard } from '../components/Post';
import { FollowButton, SuggestionsCard, TrendsCard } from '../components/Rail';
import { RightFooter } from '../components/Layout';

export function ProfileStrength() {
  const { profile, openModal } = useApp();
  const checks = [
    { label: 'Add a profile photo', done: !!profile.avatar, weight: 30 },
    { label: 'Write a bio', done: !!profile.bio.trim(), weight: 30 },
    { label: 'Add a location', done: !!profile.location.trim(), weight: 30 },
    { label: 'Add a website', done: !!profile.website.trim(), weight: 10 },
  ];
  const percentage = checks.reduce((total, item) => total + (item.done ? item.weight : 0), 0);
  return <section className="panel profile-strength"><h2>{percentage === 100 ? 'Your profile is complete' : 'Your profile is looking good'}</h2><div className="profile-progress"><div className="progress-ring" style={{ '--progress': `${percentage}%` } as React.CSSProperties}><span>{percentage}%</span></div><p>{percentage === 100 ? 'Looking good! Your community can now get to know the real you.' : 'Add a few more details to help your people get to know you.'}</p></div><div className="profile-checklist">{checks.map(item => <button key={item.label} onClick={() => openModal('edit-profile')} className={item.done ? 'done' : ''}>{item.done ? <span className="check-circle"><Check size={13} strokeWidth={3} /></span> : <Circle size={22} />}<span>{item.label}</span></button>)}</div></section>;
}
export default function ProfilePage() {
  const { id = 'bashir' } = useParams();
  const { profile, posts, openModal } = useApp();
  const [tab, setTab] = useState('posts');
  const own = id === 'bashir';
  const person = getPerson(id);
  const name = own ? profile.name : person.name;
  const handle = own ? profile.handle : person.handle;
  const avatar = own ? profile.avatar : person.avatar;
  const bio = own ? profile.bio : person.bio;
  const location = own ? profile.location : person.location;
  const authorPosts = posts.filter(p => p.authorId === id);
  const shown = authorPosts.filter(p => tab === 'posts' || (tab === 'media' && p.image) || (tab === 'likes' && p.liked)).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  const website = own ? profile.website : id === 'david' ? 'https://github.com' : '';
  const safeWebsite = website && /^https?:\/\//i.test(website) ? website : '';
  return <div className="profile-layout"><div className="profile-column"><section className="panel profile-card"><div className="profile-cover">{own && profile.cover ? <img src={profile.cover} alt="Your profile cover" /> : own ? <CoverArt /> : <div className={`person-cover person-cover-${id}`}><span /><span /><span /></div>}</div><div className="profile-info"><div className="profile-topline"><Avatar src={avatar} alt={name} size={166} className="profile-avatar" /><div className="profile-buttons">{own ? <button className="button secondary" onClick={() => openModal('edit-profile')}><Pencil size={18} />Edit profile</button> : <><FollowButton id={id} /><button className="button secondary" onClick={() => openModal('new-message', { personId: id })}><MessageCircle size={17} />Message</button></>}</div></div><h1>{name}</h1><Link to={`/profile/${id}`} className="profile-handle">@{handle}</Link><p className="profile-bio">{bio}</p><div className="profile-metadata">{location && <span><MapPin size={18} />{location}</span>}<span><CalendarDays size={18} />Joined October 2026</span>{safeWebsite && <a href={safeWebsite} target="_blank" rel="noreferrer"><LinkIcon size={17} />{safeWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>}</div><div className="profile-stats"><button onClick={() => openModal('people', { kind: 'following', personId: id })}><strong>{own ? 284 : 128}</strong><span>Following</span></button><button onClick={() => openModal('people', { kind: 'followers', personId: id })}><strong>{own ? '1,248' : id === 'amina' ? '2.8K' : '842'}</strong><span>Followers</span></button></div></div><Tabs items={[{ id: 'posts', label: 'Posts' }, ...(!own ? [{ id: 'replies', label: 'Replies' }] : []), { id: 'media', label: 'Media' }, { id: 'likes', label: 'Likes' }]} value={tab} onChange={setTab} className="profile-tabs" /></section><div className="profile-posts">{tab === 'replies' ? <div className="panel"><EmptyState icon={<MessageCircle size={32} />} title="The conversation goes both ways" description={`${name}’s replies to other people will appear here.`} /></div> : shown.map(post => <PostCard key={post.id} post={post} showPinned />)}{tab !== 'replies' && shown.length === 0 && <div className="panel"><EmptyState icon={tab === 'media' ? <ImageIcon size={32} /> : tab === 'likes' ? <Heart size={32} /> : <UserRound size={32} />} title={tab === 'media' ? 'No photos yet' : tab === 'likes' ? 'No likes to show yet' : 'A fresh start'} description={own ? 'Your next conversation starts with a post. Share what’s on your mind.' : `When ${name} shares something, you’ll find it here.`}>{own && <button className="button primary" onClick={() => openModal('compose')}>Create a post</button>}</EmptyState></div>}</div>{shown.some(p => p.pinned) && tab === 'posts' && <span className="sr-only"><Pin />Includes a pinned post</span>}</div><aside className="right-rail profile-rail">{own && <ProfileStrength />}<SuggestionsCard limit={2} /><TrendsCard /><RightFooter /></aside></div>;
}