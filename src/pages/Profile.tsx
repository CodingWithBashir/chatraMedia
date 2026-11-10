import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, MapPin, CalendarDays, Link as LinkIcon, Pin, Check, Circle, MessageCircle, Image as ImageIcon, Heart, UserRound } from 'lucide-react';
import { useApp } from '../store';
import { getPerson } from '../data';
import { Avatar, CoverArt, Tabs, EmptyState } from '../components/UI';
import { PostCard } from '../components/Post';
import { FollowButton, SuggestionsCard, TrendsCard } from '../components/Rail';
import { RightFooter } from '../components/Layout';
import type { Profile as ProfileType } from '../types';
import { isUuid, supabase } from '../lib/supabase';

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
  const navigate = useNavigate();
  const { profile, posts, openModal, session } = useApp();
  const [tab, setTab] = useState('posts');
  const [remoteProfile, setRemoteProfile] = useState<ProfileType | null>(null);
  const own = id === 'bashir' || id === session?.user.id;
  const person = { ...getPerson(id), ...(remoteProfile ? { name: remoteProfile.name, handle: remoteProfile.handle, avatar: remoteProfile.avatar, bio: remoteProfile.bio, location: remoteProfile.location, role: remoteProfile.role || '' } : {}) };
  useEffect(() => { if (!supabase || !isUuid(id) || own) { setRemoteProfile(null); return; } let active=true; void supabase.from('profiles').select('username,display_name,bio,location,website,avatar_url,cover_url,role').eq('id',id).maybeSingle().then(({data})=>{if(active&&data)setRemoteProfile({name:data.display_name,handle:data.username,bio:data.bio,location:data.location,website:data.website,avatar:data.avatar_url||'/images/bashir-profile.webp',cover:data.cover_url||undefined,role:data.role})}); return()=>{active=false}; },[id,own]);
  const name = own ? profile.name : person.name;
  const handle = own ? profile.handle : person.handle;
  const avatar = own ? profile.avatar : person.avatar;
  const bio = own ? profile.bio : person.bio;
  const location = own ? profile.location : person.location;
  const authorPosts = posts.filter(p => p.authorId === id);
  const shown = authorPosts.filter(p => tab === 'posts' || (tab === 'media' && p.image) || (tab === 'likes' && p.liked)).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  const website = own ? profile.website : remoteProfile?.website || (id === 'david' ? 'https://github.com' : '');
  const safeWebsite = website && /^https?:\/\//i.test(website) ? website : '';
  return <div className="profile-layout"><div className="profile-column"><section className="panel profile-card"><div className="profile-cover">{(own ? profile.cover : remoteProfile?.cover) ? <img src={(own ? profile.cover : remoteProfile?.cover)!} alt={`${name} profile cover`} /> : own ? <CoverArt /> : <div className={`person-cover person-cover-${id}`}><span /><span /><span /></div>}</div><div className="profile-info"><div className="profile-topline"><Avatar src={avatar} alt={name} size={166} className="profile-avatar" /><div className="profile-buttons">{own ? <button className="button secondary" onClick={() => navigate('/profile/edit')}><Pencil size={18} />Edit profile</button> : <><FollowButton id={id} /><button className="button secondary" onClick={() => openModal('new-message', { personId: id })}><MessageCircle size={17} />Message</button></>}</div></div><h1>{name}</h1><Link to={`/profile/${id}`} className="profile-handle">@{handle}</Link><p className="profile-bio">{bio}</p><div className="profile-metadata">{location && <span><MapPin size={18} />{location}</span>}<span><CalendarDays size={18} />Joined October 2026</span>{safeWebsite && <a href={safeWebsite} target="_blank" rel="noreferrer"><LinkIcon size={17} />{safeWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>}</div><div className="profile-stats"><button onClick={() => navigate(`/profile/${id}/following`)}><strong>{own ? 284 : 128}</strong><span>Following</span></button><button onClick={() => navigate(`/profile/${id}/followers`)}><strong>{own ? '1,248' : id === 'amina' ? '3.8K' : '842'}</strong><span>Followers</span></button></div></div><Tabs items={[{ id: 'posts', label: 'Posts' }, ...(!own ? [{ id: 'replies', label: 'Replies' }] : []), { id: 'media', label: 'Media' }, { id: 'likes', label: 'Likes' }]} value={tab} onChange={setTab} className="profile-tabs" /></section><div className="profile-posts">{tab === 'replies' ? <div className="panel"><EmptyState icon={<MessageCircle size={32} />} title="The conversation goes both ways" description={`${name}’s replies to other people will appear here.`} /></div> : shown.map(post => <PostCard key={post.id} post={post} showPinned />)}{tab !== 'replies' && shown.length === 0 && <div className="panel"><EmptyState icon={tab === 'media' ? <ImageIcon size={32} /> : tab === 'likes' ? <Heart size={32} /> : <UserRound size={32} />} title={tab === 'media' ? 'No photos yet' : tab === 'likes' ? 'No likes to show yet' : 'A fresh start'} description={own ? 'Your next conversation starts with a post. Share what’s on your mind.' : `When ${name} shares something, you’ll find it here.`}>{own && <button className="button primary" onClick={() => openModal('compose')}>Create a post</button>}</EmptyState></div>}</div>{shown.some(p => p.pinned) && tab === 'posts' && <span className="sr-only"><Pin />Includes a pinned post</span>}</div><aside className="right-rail profile-rail">{own && <ProfileStrength />}<SuggestionsCard limit={2} /><TrendsCard /><RightFooter /></aside></div>;
}