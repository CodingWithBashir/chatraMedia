import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Smile, Globe2, ChevronDown, X, Send, Camera, Check, Users, Code2, Palette, Rocket, BookOpen, ArrowRight, CalendarDays, MapPin, Download, ShieldCheck, Info, MessageCircle, Heart, Repeat2, Copy, UserRound, Settings, Flag, ExternalLink } from 'lucide-react';
import type { Community, Profile } from '../types';
import { useApp, uid, nowTime, readImage } from '../store';
import { isUuid, supabase } from '../lib/supabase';
import { getPerson, people, meetupDate } from '../data';
import { Modal, Avatar, Logo, SearchInput, EmptyState, CoverArt } from './UI';
import { PostCard } from './Post';
import { FollowButton } from './Rail';

type FormData = Record<string, string>;
function ComposeForm({ data, onClose }: { data: FormData; onClose: () => void }) {
  const { profile, createPost, notify, communities, session } = useApp();
  const [text, setText] = useState(data.draftText || (data.poll === 'true' ? 'Which Chatra feature should we build next? 📊' : ''));
  const [image, setImage] = useState('');
  const [audience, setAudience] = useState('Everyone');
  const [emojiOpen, setEmojiOpen] = useState(data.emoji === 'true');
  const [mediaOpen, setMediaOpen] = useState(data.media === 'true');
  const pollOpen = data.poll === 'true';
  const [pollOptions, setPollOptions] = useState<string[]>(pollOpen ? ['Voice messages', 'Communities', 'Better search', 'Scheduled posts'] : ['', '']);
  const [pollDuration, setPollDuration] = useState('1 day');
  const [pollMultiple, setPollMultiple] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const community = communities.find(c => c.id === data.communityId);
  const upload = async (file?: File) => { if (!file) return; try { setImage(await readImage(file)); setMediaOpen(false); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'Could not upload image.'); } };
  const saveDraft = () => {
    if (!text.trim() && !image) { setError('Add a few words or an image before saving your draft.'); return; }
    try {
      const key = 'chatra:v1:draft-items';
      const saved = JSON.parse(localStorage.getItem(key) || '[]') as Array<{id:string;title:string;text:string;image?:string;status:string;date:string;updated:string}>;
      const id = data.draftId || `draft-${uid()}`;
      const draft = { id, title: text.trim().split('\n')[0].slice(0, 70) || 'Untitled draft', text: text.trim(), image: image || undefined, status: 'Draft', date: '', updated: 'Just now' };
      localStorage.setItem(key, JSON.stringify([draft, ...saved.filter(item => item.id !== id)]));
      onClose(); notify('Draft saved on this device.');
    } catch { setError('Could not save this draft. Device storage may be full.'); }
  };
  const publish = () => {
    if (!session) { onClose(); notify('Create an account or sign in to publish posts.'); navigate('/login'); return; }
    const choices = pollOptions.map(option => option.trim()).filter(Boolean);
    if (!text.trim() && !image && !choices.length) { setError('Add a few words, a photo, or a poll before sharing.'); return; }
    if (pollOpen && choices.length < 2) { setError('Add at least two poll choices.'); return; }
    createPost({ id: session ? crypto.randomUUID() : `post-${uid()}`, authorId: session?.user.id || 'bashir', text: text.trim(), image: image || undefined, time: 'Just now', likes: 0, comments: 0, reposts: 0, tags: [], communityId: community?.id, pollOptions: pollOpen ? choices.slice(0, 4) : undefined, pollVotes: pollOpen ? choices.slice(0, 4).map(() => 0) : undefined, pollDuration: pollOpen ? pollDuration : undefined, pollMultiple: pollOpen ? pollMultiple : undefined });
    onClose(); notify(community ? `Shared with ${community.name}` : 'Your post is live. Let the conversation begin!');
    navigate(community ? `/communities?community=${community.id}` : '/');
  };
  return <Modal title={pollOpen ? 'Create a poll' : community ? `Post to ${community.name}` : 'Create a post'} onClose={onClose} className={`compose-modal ${pollOpen ? 'poll-compose-modal' : ''}`}><div className="compose-identity"><Avatar src={profile.avatar} alt={profile.name} size={47} /><div><strong>{profile.name}</strong><span className="audience-select"><Globe2 size={13} /><select aria-label="Post audience" value={audience} onChange={e => setAudience(e.target.value)}><option>Everyone</option><option>People you follow</option></select><ChevronDown size={13} /></span></div></div><textarea className="compose-textarea" data-autofocus value={text} maxLength={500} onChange={e => setText(e.target.value)} placeholder={community ? 'Share something with your community...' : 'What are you sharing today?'} aria-label="Post text" />{pollOpen && <fieldset className="poll-builder poll-builder-rich"><legend>Poll options</legend><div className="poll-choice-list">{pollOptions.map((option, index) => <label key={index}><span className="poll-grip">⠿</span><input value={option} maxLength={50} placeholder={`Choice ${index + 1}`} onChange={e => setPollOptions(prev => prev.map((item, i) => i === index ? e.target.value : item))} />{pollOptions.length > 2 && <button type="button" aria-label={`Remove choice ${index + 1}`} onClick={() => setPollOptions(prev => prev.filter((_, i) => i !== index))}><X size={15} /></button>}</label>)}</div>{pollOptions.length < 4 && <button className="button secondary poll-add-option" type="button" onClick={() => setPollOptions(prev => [...prev, ''])}>＋ Add option</button>}<div className="poll-settings"><label>Poll duration<select value={pollDuration} onChange={e => setPollDuration(e.target.value)}>{['1 day','2 days','3 days','7 days'].map(x=><option key={x}>{x}</option>)}</select></label><label className="poll-multiple"><input type="checkbox" checked={pollMultiple} onChange={e => setPollMultiple(e.target.checked)}/><span><strong>Allow multiple answers</strong><small>People can choose more than one option.</small></span></label></div><span>Polls are sample interactions saved on this device.</span></fieldset>}{image && <div className="compose-image-preview"><img src={image} alt="Your attached image" /><button className="image-remove" aria-label="Remove attached image" onClick={() => setImage('')}><X size={17} /></button></div>}{mediaOpen && <div className="media-picker"><div><strong>Add a little something</strong><button className="text-link" onClick={() => fileInput.current?.click()}>Upload a photo <ImageIcon size={15} /></button></div><div>{[{ src: '/images/workspace.webp', label: 'Creative workspace' }, { src: '/images/kigali.webp', label: 'Kigali city' }, { src: '/images/chatra-preview.webp', label: 'Chatra preview' }].map(item => <button key={item.src} onClick={() => { setImage(item.src); setMediaOpen(false); }}><img src={item.src} alt={item.label} /><span>{item.label}</span></button>)}</div></div>}{emojiOpen && <div className="emoji-picker compose-emoji">{['1F60A','1F49A','1F389','1F44F','1F525','2728','1F64C','1F680','1F60D','1F44D','1F30D','2615'].map(code => { const emoji = String.fromCodePoint(parseInt(code, 16)); return <button key={code} aria-label={`Insert ${emoji}`} onClick={() => setText(prev => (prev + emoji).slice(0, 500))}>{emoji}</button>; })}</div>}{error && <p className="form-error" role="alert">{error}</p>}<div className="compose-attachment-bar"><span>Add to your post</span><button className="icon-button" aria-label="Upload a photo" onClick={() => fileInput.current?.click()}><ImageIcon size={21} /></button><button className="icon-button" aria-label="Choose a sample photo" onClick={() => setMediaOpen(!mediaOpen)}><Camera size={21} /></button><button className="icon-button" aria-label="Insert an emoji" onClick={() => setEmojiOpen(!emojiOpen)}><Smile size={21} /></button></div><input ref={fileInput} type="file" accept="image/*" hidden onChange={e => void upload(e.target.files?.[0])} /><footer className="modal-footer"><span className={`character-count ${text.length > 470 ? 'near-limit' : ''}`}>{text.length}/500</span><button className="button secondary small" onClick={saveDraft} disabled={!text.trim() && !image}>Save draft</button><button className="button primary" onClick={publish} disabled={!text.trim() && !image && !pollOptions.some(option => option.trim())}>Share post <Send size={17} /></button></footer></Modal>;
}
function EditProfileForm({ onClose }: { onClose: () => void }) {
  const { profile, setProfile, notify } = useApp();
  const [draft, setDraft] = useState<Profile>({ ...profile });
  const [error, setError] = useState('');
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const update = (key: keyof Profile, value: string) => setDraft(prev => ({ ...prev, [key]: value }));
  const upload = async (file: File | undefined, key: 'avatar' | 'cover') => { if (!file) return; try { update(key, await readImage(file, key === 'avatar' ? 400 : 1200)); } catch (e) { setError(e instanceof Error ? e.message : 'Could not read image.'); } };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) { setError('Please add your display name.'); return; }
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(draft.handle)) { setError('Use 3–24 letters, numbers, or underscores for your username.'); return; }
    if (draft.website && !/^https?:\/\/\S+$/i.test(draft.website)) { setError('Your website should start with https:// or http://.'); return; }
    setProfile({ ...draft, name: draft.name.trim(), handle: draft.handle.trim(), bio: draft.bio.trim(), location: draft.location.trim(), website: draft.website.trim() }); onClose(); notify('Profile updated. Looking good!');
  };
  return <Modal title="Edit profile" onClose={onClose} wide className="edit-profile-modal"><form onSubmit={submit}><div className="edit-cover">{draft.cover ? <img src={draft.cover} alt="Profile cover preview" /> : <CoverArt />}<button type="button" className="cover-upload-button" onClick={() => coverInput.current?.click()}><Camera size={18} />Change cover</button></div><div className="edit-avatar-row"><Avatar src={draft.avatar} alt={profile.name} size={90} /><button type="button" className="button secondary small" onClick={() => avatarInput.current?.click()}><Camera size={16} />Change photo</button></div><div className="form-fields"><label>Display name<input value={draft.name} onChange={e => update('name', e.target.value)} maxLength={40} required /></label><label>Username<span className="input-with-prefix"><span>@</span><input value={draft.handle} onChange={e => update('handle', e.target.value.replace(/^@/, ''))} maxLength={24} required /></span></label><label>Bio<textarea value={draft.bio} onChange={e => update('bio', e.target.value)} maxLength={160} rows={3} /><small>{draft.bio.length}/160</small></label><div className="form-two-columns"><label>Location<input value={draft.location} onChange={e => update('location', e.target.value)} placeholder="City, country" maxLength={60} /></label><label>Website<input value={draft.website} onChange={e => update('website', e.target.value)} placeholder="https://your website.com" type="url" /></label></div></div>{error && <p className="form-error" role="alert">{error}</p>}<input type="file" accept="image/*" hidden ref={avatarInput} onChange={e => void upload(e.target.files?.[0], 'avatar')} /><input type="file" accept="image/*" hidden ref={coverInput} onChange={e => void upload(e.target.files?.[0], 'cover')} /><footer className="modal-footer"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" type="submit">Save profile <Check size={17} /></button></footer></form></Modal>;
}
function NewMessageForm({ onClose }: { data: FormData; onClose: () => void }) {
  const { threads, setThreads } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const matches = people.filter(p => p.id !== 'bashir' && `${p.name} ${p.handle}`.toLowerCase().includes(query.toLowerCase()));
  const start = (personId: string) => {
    let thread = threads.find(t => t.personId === personId);
    if (!thread) { thread = { id: personId, personId, time: 'Now', unread: 0, messages: [] }; const created = thread; setThreads(prev => [created, ...prev]); }
    onClose(); navigate(`/messages/${thread.id}`);
  };
  return <Modal title="Start a conversation" onClose={onClose}><div className="modal-body"><SearchInput value={query} onChange={setQuery} placeholder="Search people by name or username" /><p className="field-section-label">PEOPLE YOU MAY KNOW</p><div className="contact-picker">{matches.map(person => <button key={person.id} onClick={() => start(person.id)}><Avatar src={person.avatar} alt={person.name} size={46} online={person.online} /><span><strong>{person.name}</strong><span>@{person.handle} · {person.role}</span></span><MessageCircle size={20} /></button>)}{matches.length === 0 && <EmptyState title="No people found" description="Try a different name or username." />}</div>{!query && <><p className="field-section-label">YOUR GROUPS</p><div className="group-picker">{threads.filter(t => t.group).map(thread => <button className="chip" key={thread.id} onClick={() => { onClose(); navigate(`/messages/${thread.id}`); }}><Users size={15} />{thread.name}</button>)}</div></>}</div></Modal>;
}
function CreateCommunityForm({ onClose }: { onClose: () => void }) {
  const { communities, setCommunities, notify } = useApp();
  const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [category, setCategory] = useState('Technology');
  const [icon, setIcon] = useState<Community['icon']>('code'); const [error, setError] = useState('');
  const navigate = useNavigate();
  const icons = [{ id: 'code', icon: Code2 }, { id: 'camera', icon: Camera }, { id: 'palette', icon: Palette }, { id: 'rocket', icon: Rocket }, { id: 'book', icon: BookOpen }, { id: 'globe', icon: Users }] as const;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) { setError('Give your community a name with at least 3 characters.'); return; }
    if (communities.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) { setError('A community with this name already exists. Try another.'); return; }
    const id = `community-${uid()}`;
    setCommunities(prev => [...prev, { id, name: name.trim(), description: description.trim(), category, icon, color: '#22dfcc', members: '1', joined: true }]);
    onClose(); navigate(`/communities?community=${id}`); notify('Your community is ready. Make it feel like home!');
  };
  return <Modal title="Create a community" onClose={onClose}><form onSubmit={submit} className="modal-body form-fields"><div className="form-intro"><Users size={30} /><p>Big things start with a few good people. Give yours a place to connect.</p></div><label>Community name<input data-autofocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kigali Creative Coders" maxLength={50} required /></label><label>What’s your community about?<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell people what brings you together..." maxLength={240} rows={3} required /></label><label>Category<select value={category} onChange={e => setCategory(e.target.value)}>{['Technology', 'Art & culture', 'Creators', 'Lifestyle', 'Education', 'Sports'].map(c => <option key={c}>{c}</option>)}</select></label><fieldset className="icon-picker"><legend>Choose a symbol</legend><div>{icons.map(item => <button type="button" key={item.id} className={icon === item.id ? 'selected' : ''} onClick={() => setIcon(item.id)} aria-label={`${item.id} icon`} aria-pressed={icon === item.id}><item.icon size={25} /></button>)}</div></fieldset>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-footer"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button type="submit" className="button primary">Create community <ArrowRight size={17} /></button></div></form></Modal>;
}
function PostDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { posts, setPosts, comments, setComments, profile, session, notify } = useApp();
  const [draft, setDraft] = useState('');
  const post = posts.find(p => p.id === id);
  useEffect(() => { if(!supabase||!isUuid(id))return;let active=true;void supabase.from('comments').select('id,user_id,content,created_at,profiles!comments_user_id_fkey(id,username,display_name,avatar_url)').eq('post_id',id).order('created_at',{ascending:true}).then(({data,error})=>{if(error){console.warn('Chatra comment sync:',error.message);return}if(active&&data)setComments(prev=>({...prev,[id]:data.map((row:any)=>({id:row.id,authorId:row.user_id,text:row.content,time:new Date(row.created_at).toLocaleString([], {dateStyle:'short',timeStyle:'short'}),authorSnapshot:{id:row.user_id,name:row.profiles?.display_name||'Chatra member',handle:row.profiles?.username||'member',avatar:row.profiles?.avatar_url||'/images/bashir-profile.webp'}}))}))});return()=>{active=false};},[id]);
  if (!post) return <Modal title="Post" onClose={onClose}><EmptyState title="This post is no longer available" description="It may have been removed by its author." /></Modal>;
  const thread = comments[id] || [];
  const send = (e: React.FormEvent) => { e.preventDefault(); if (!draft.trim()) return; if(supabase&&(!session||!isUuid(id))){notify('Sign in to comment on a live post.');return;}const newComment={id:session?crypto.randomUUID():uid(),authorId:session?.user.id||'bashir',text:draft.trim(),time:'Just now',authorSnapshot:session?{id:session.user.id,name:profile.name,handle:profile.handle,avatar:profile.avatar}:undefined};setComments(prev=>({...prev,[id]:[...(prev[id]||[]),newComment]}));setPosts(prev=>prev.map(p=>p.id===id?{...p,comments:p.comments+1}:p));setDraft('');if(supabase&&session)void supabase.from('comments').insert({id:newComment.id,post_id:id,user_id:session.user.id,content:newComment.text}).then(({error})=>{if(error)notify(`Comment is visible here, but database save failed: ${error.message}`)}); };
  return <Modal title="The conversation" onClose={onClose} wide className="post-detail-modal"><PostCard post={post} detail /><div className="comments-section"><h3>Replies</h3>{thread.map(comment => { const person = comment.authorSnapshot || getPerson(comment.authorId); const ownComment=comment.authorId==='bashir'||comment.authorId===session?.user.id; return <div className="comment" key={comment.id}><Avatar src={ownComment ? profile.avatar : person.avatar} alt={ownComment?profile.name:person.name} size={35} /><div><div><strong>{ownComment ? profile.name : person.name}</strong><time>{comment.time}</time></div><p>{comment.text}</p></div></div>; })}{thread.length === 0 && <p className="muted">Be the first to add a little to the conversation.</p>}</div><form className="comment-form" onSubmit={send}><Avatar src={profile.avatar} alt={profile.name} size={36} /><input aria-label="Write a reply" placeholder="Add to the conversation..." value={draft} onChange={e => setDraft(e.target.value)} maxLength={500} /><button className="send-button" type="submit" aria-label="Send reply" disabled={!draft.trim()}><Send size={18} /></button></form></Modal>;
}
function CreateStoryForm({ onClose }: { onClose: () => void }) {
  const { userStory, setUserStory, notify } = useApp();
  const [text, setText] = useState('');
  const [image, setImage] = useState(userStory?.image || '/images/kigali.webp');
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const upload = async (file?: File) => { if (!file) return; try { setImage(await readImage(file)); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'Could not read this photo.'); } };
  return <Modal title="A little moment, your way" onClose={onClose} className="create-story-modal"><div className="story-create-preview"><img src={image} alt="Your story background" /><span>Your story preview</span></div><div className="modal-body form-fields"><label>Add a caption<textarea data-autofocus rows={3} maxLength={180} value={text} onChange={e => setText(e.target.value)} placeholder="What’s happening in your world?" /></label><small className="muted story-char-count">{text.length}/180</small><input ref={input} type="file" accept="image/*" hidden onChange={e => void upload(e.target.files?.[0])} /><div className="story-media-actions"><button className="button secondary small" onClick={() => input.current?.click()}><ImageIcon size={16} />Choose your photo</button><span>or pick a moment</span>{['/images/workspace.webp', '/images/kigali-hills.webp'].map(src => <button key={src} aria-label="Choose sample image" onClick={() => setImage(src)}><img src={src} alt="" /></button>)}</div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-footer"><button className="button secondary" onClick={onClose}>Not now</button><button className="button primary" disabled={!text.trim() && !image} onClick={() => { setUserStory({ text: text.trim() || 'A little moment from today.', image, createdAt: Date.now() }); onClose(); notify('Your story is ready to share.'); }}>Share story <ArrowRight size={16} /></button></div></div></Modal>;
}
function StoryViewer({ id, onClose }: { id: string; onClose: () => void }) {
  const { profile, userStory, setThreads, notify } = useApp();
  const storyPeople = [...people.slice(1), ...(userStory ? [{ ...people[0], name: profile.name, handle: profile.handle, avatar: profile.avatar, bio: profile.bio }] : [])];
  const index = Math.max(0, storyPeople.findIndex(p => p.id === id));
  const [current, setCurrent] = useState(index);
  const [reply, setReply] = useState('');
  const navigate = useNavigate();
  const person = storyPeople[current];
  const stories = [
    { image: '/images/workspace.webp', text: 'A little behind the scenes of my next design project. Good things take a little curiosity.', label: 'Making things, thoughtfully.' },
    { image: '/images/goals-cli.webp', text: 'Shipped something small today. Tomorrow, we make it a little better.', label: 'One commit at a time.' },
    { image: '/images/kigali.webp', text: 'Took the long way home. Found a whole new perspective on the city I love.', label: 'There’s a story in every corner.' },
    { image: '/images/kigali-hills.webp', text: 'Room to think. Space to build. A fresh perspective for the week ahead.', label: 'A little room to breathe.' },
  ];
  const sampleStory = stories[Math.min(current, stories.length - 1)];
  const story = person.id === 'bashir' && userStory ? { image: userStory.image, text: userStory.text, label: 'A little moment, your way.' } : sampleStory;
  const send = (e: React.FormEvent) => { e.preventDefault(); if (!reply.trim()) return; if (person.id === 'bashir') { notify('This is your story — share it with your people instead.'); setReply(''); return; } const existing = person.id; setThreads(prev => prev.map(t => t.id === existing ? { ...t, messages: [...t.messages, { id: uid(), sender: 'me', text: reply.trim(), time: nowTime() }], time: nowTime() } : t)); onClose(); navigate(`/messages/${existing}`); notify('Your reply was added to the conversation'); };
  return <Modal title={`${person.name}’s story`} onClose={onClose} className="story-modal"><div className="story-viewer"><img src={story.image} alt={story.label} /><div className="story-progress" key={current}><span /></div><div className="story-viewer-header"><Avatar src={person.avatar} alt={person.name} size={39} /><div><strong>{person.name}</strong><span>{person.id === 'bashir' ? 'Your story · Saved on this device' : '2 hours ago · Sample story'}</span></div></div><button className="story-prev" aria-label="Previous story" disabled={current === 0} onClick={() => setCurrent(current - 1)}>‹</button><button className="story-next" aria-label="Next story" disabled={current >= storyPeople.length - 1} onClick={() => setCurrent(current + 1)}>›</button><div className="story-caption"><span>{person.role}</span><h2>{story.label}</h2><p>{story.text}</p></div></div><form className="story-reply" onSubmit={send}><input value={reply} onChange={e => setReply(e.target.value)} placeholder={person.id === 'bashir' ? 'Your own story — looking good!' : `Reply to ${person.name}...`} aria-label={`Reply to ${person.name}'s story`} /><button className="send-button" disabled={!reply.trim()} aria-label="Send story reply"><Send size={19} /></button></form></Modal>;
}
function EventModal({ onClose }: { onClose: () => void }) {
  const { notify } = useApp();
  const [going, setGoing] = useState(() => localStorage.getItem('chatra:v1:rsvp') === 'true');
  const rsvp = () => { setGoing(!going); try { localStorage.setItem('chatra:v1:rsvp', String(!going)); } catch { /* Session-only fallback. */ } notify(going ? 'Your RSVP has been removed' : 'You’re on the list! Your RSVP is saved on this device.'); };
  const calendar = () => {
    const date = new Date(); date.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7 || 7)); date.setHours(16, 0, 0, 0);
    const format = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}0000`;
    const end = new Date(date); end.setHours(19);
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Chatra//Community//EN', 'BEGIN:VEVENT', `UID:kigali-dev-${date.toDateString().replace(/\s/g, '')}@chatra.local`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`, `DTSTART:${format(date)}`, `DTEND:${format(end)}`, 'SUMMARY:Kigali Dev Meetup', 'LOCATION:Kigali\, Rwanda', 'DESCRIPTION:Build\, learn\, and connect with the Kigali Developers community. Sample event from the Chatra prototype.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); const a = document.createElement('a'); a.href = url; a.download = 'kigali-dev-meetup.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Calendar event downloaded');
  };
  return <Modal title="Good people. In real life." onClose={onClose} className="event-modal"><img className="event-cover" src="/images/meetup.webp" alt="The Kigali developer community at a meetup" /><div className="modal-body"><span className="eyebrow">KIGALI DEVELOPERS</span><h2 className="event-title">Kigali Dev Meetup</h2><div className="event-facts"><span><CalendarDays size={19} />{meetupDate} · 4:00 PM – 7:00 PM</span><span><MapPin size={19} />Kigali, Rwanda</span></div><p>An afternoon of good conversations, small demos, and big ideas. Bring something you’re building, a question you’re curious about, or just yourself. All experience levels are welcome.</p><div className="event-attendance"><span className="avatar-stack">{people.slice(0, 4).map(p => <Avatar key={p.id} src={p.avatar} alt={p.name} size={31} />)}</span><span>{going ? 184 : 183} people going</span></div><div className="event-actions"><button className={`button ${going ? 'secondary' : 'primary'}`} onClick={rsvp}>{going ? <><Check size={18} />You’re going</> : <>Count me in <ArrowRight size={18} /></>}</button><button className="button secondary" onClick={calendar}><Download size={17} />Add to calendar</button></div><p className="form-note">Sample community event · RSVP is saved locally.</p></div></Modal>;
}
function HelpModal({ section, onClose }: { section: string; onClose: () => void }) {
  const content = section === 'privacy' ? [
    ['Your data stays on this device', 'This prototype saves your profile, posts, messages, and preferences in your browser’s local storage. There is no connected Chatra server or remote account.'],
    ['You’re in control', 'Edit your profile, delete posts you create, clear conversations, and export your data from Settings. Clearing this site’s browser data removes all locally saved changes.'],
    ['Photos and permissions', 'Photos you attach are processed in your browser. Demo calls do not access your camera, microphone, or screen. Notification and language choices are saved preferences, not connected services.'],
  ] : section === 'safety' ? [
    ['Keep conversations kind', 'Treat people with respect. Harassment, hate speech, threats, and sharing someone’s private information have no place here.'],
    ['Make room for real people', 'Avoid spam, impersonation, and misleading content. Share useful work and credit the people who made it.'],
    ['Get support', 'If something feels wrong, pause the conversation. For a production service, reporting and blocking should be reviewed by a moderation team; this prototype does not send reports to a live service.'],
  ] : [
    ['Find your way around', 'Use the sidebar on desktop or the bottom navigation on mobile. Explore helps you discover people, topics, and communities.'],
    ['Start a conversation', 'Open Messages, choose a person, and send a text or photo. Your conversation is saved on this device. The call screens are interactive demonstrations.'],
    ['Make it yours', 'Edit your profile, bookmark posts, join communities, and change your theme in Settings. Personalize your experience from your account menu.'],
  ];
  return <Modal title={section === 'privacy' ? 'Your privacy, in plain words' : section === 'safety' ? 'A safer space for everyone' : 'A little help along the way'} onClose={onClose}><div className="modal-body help-content"><span className="help-hero-icon">{section === 'help' ? <MessageCircle size={32} /> : <ShieldCheck size={32} />}</span>{content.map(([title, text], i) => <details key={title} open={i === 0}><summary>{title}<ChevronDown size={17} /></summary><p>{text}</p></details>)}<div className="settings-info"><Info size={19} /><p>Chatra is an interactive frontend prototype based on the supplied designs, not a production social network.</p></div></div></Modal>;
}
function ReportPostForm({ data, onClose }: { data: FormData; onClose: () => void }) {
  const { posts, profile, notify, session } = useApp();
  const [reason, setReason] = useState('Spam');
  const [context, setContext] = useState('');
  const post = posts.find(item => item.id === data.postId);
  const author = post ? (post.authorId === 'bashir' ? profile : getPerson(post.authorId)) : getPerson('amina');
  const reasons = [
    ['Spam', 'Unwanted or repetitive content'],
    ['Harassment', 'Bullying, threats, or harmful behavior'],
    ['Impersonation', 'Pretending to be someone else'],
    ['Misleading information', 'False or misleading content'],
    ['Something else', 'A different issue'],
  ];
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { const reports = JSON.parse(localStorage.getItem('chatra:v1:reports') || '[]'); localStorage.setItem('chatra:v1:reports', JSON.stringify([...reports, { postId: data.postId, reason, context: context.trim(), time: nowTime() }])); } catch { /* Demo acknowledgement only. */ }
    if(supabase&&session&&isUuid(data.postId)){const{error}=await supabase.from('moderation_reports').insert({reporter_id:session.user.id,post_id:data.postId,reason,context:context.trim()});if(error){notify(`Report stored on this device; server submission failed: ${error.message}`);onClose();return}}
    onClose(); notify(session&&isUuid(data.postId)?'Report submitted to the Chatra database.':'Report saved on this device. Sign in to submit reports to the database.');
  };
  return <Modal title="Report a post" onClose={onClose} wide className="report-post-modal"><form className="report-post-form" onSubmit={submit}><section className="report-reasons"><h3>Why are you reporting this post?</h3>{reasons.map(([title,description])=><label className={`report-reason ${reason===title?'selected':''}`} key={title}><input type="radio" name="report-reason" checked={reason===title} onChange={()=>setReason(title)}/><span className="report-radio-mark"/><span><strong>{title}</strong><small>{description}</small></span></label>)}<label className="report-context-label">Additional context (optional)<textarea maxLength={500} rows={3} value={context} onChange={e=>setContext(e.target.value)} placeholder="Add details that could help our moderators."/><small>{context.length}/500</small></label><p className="report-disclaimer"><ShieldCheck size={16}/>Reports are reviewed by our moderators. This prototype stores reports only on this device.</p></section><aside className="reported-post-preview"><h3>Reported post preview</h3><article className="panel"><header><Avatar src={author.avatar} alt={author.name} size={36}/><span><strong>{author.name}</strong><small>@{author.handle} · {post?.time||'2h'}</small></span></header><p>{post?.text||'A sample post from the community.'}</p>{post?.image&&<img src={post.image} alt="Reported content"/>}<footer><MessageCircle size={14}/>{post?.comments||12}<Repeat2 size={14}/>{post?.reposts||8}<Heart size={14}/>{post?.likes||96}</footer></article></aside><footer className="report-modal-footer"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" type="submit"><Flag size={16}/>Submit report</button></footer></form></Modal>;
}
function SimpleForms({ type, data, onClose }: { type: string; data: FormData; onClose: () => void }) {
  const { notify, setThreads, settings, setSettings } = useApp();
  const [words, setWords] = useState(() => { try { return JSON.parse(localStorage.getItem('chatra:v1:muted-words') || '[]').join(', '); } catch { return ''; } });
  const [blocked, setBlocked] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('chatra:v1:blocked') || '[]'); } catch { return []; } });
  if (type === 'security') return <Modal title="A little extra account care" onClose={onClose}><div className="modal-body security-modal"><ShieldCheck size={46} /><h2>Two-factor authentication</h2><p>In a connected Chatra service, two-factor authentication adds a verification step when you sign in.</p><div className="settings-info"><Info size={20} /><p>This prototype has no authentication backend. You can preview the enabled preference, but it does not provide real account security.</p></div><button className="button primary" onClick={() => { setSettings({ ...settings, twoFactor: !settings.twoFactor }); notify(settings.twoFactor ? 'Demo two-factor preference disabled' : 'Demo two-factor preference enabled'); onClose(); }}>{settings.twoFactor ? 'Disable demo preference' : 'Enable demo preference'}</button></div></Modal>;
  if (type === 'muted-words') return <Modal title="A little less noise" onClose={onClose}><form className="modal-body form-fields" onSubmit={e => { e.preventDefault(); const values = words.split(',').map((w: string) => w.trim().toLowerCase()).filter(Boolean); try { localStorage.setItem('chatra:v1:muted-words', JSON.stringify(values)); notify('Muted words saved. Matching posts are hidden from your feed.'); onClose(); } catch { notify('Could not save muted words on this device.'); } }}><label>Words or phrases to mute<input value={words} onChange={e => setWords(e.target.value)} placeholder="e.g. spoilers, scores, elections" /></label><p className="muted">Separate words with commas. Posts containing these words will be hidden from your home feed.</p><div className="modal-footer"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" type="submit">Save muted words</button></div></form></Modal>;
  if (type === 'blocked') return <Modal title="Blocked accounts" onClose={onClose}><div className="modal-body"><p className="muted">People you block won’t appear in your home feed or suggestions.</p><div className="blocked-list">{people.filter(p => p.id !== 'bashir').map(person => <div key={person.id}><Avatar src={person.avatar} alt={person.name} size={42} /><span><strong>{person.name}</strong><span>@{person.handle}</span></span><button className={`button small ${blocked.includes(person.id) ? 'secondary' : 'outline-danger'}`} onClick={() => { const next = blocked.includes(person.id) ? blocked.filter(id => id !== person.id) : [...blocked, person.id]; setBlocked(next); try { localStorage.setItem('chatra:v1:blocked', JSON.stringify(next)); notify(blocked.includes(person.id) ? `${person.name} unblocked` : `${person.name} blocked`); } catch { notify('Could not save this change.'); } }}>{blocked.includes(person.id) ? 'Unblock' : 'Block'}</button></div>)}</div></div></Modal>;
  if (type === 'clear-chat') return <Modal title="Clear this conversation?" onClose={onClose}><div className="modal-body"><p>This removes the messages and shared media in this conversation from this device. This can’t be undone.</p><div className="modal-footer"><button className="button secondary" onClick={onClose}>Keep messages</button><button className="button danger" onClick={() => { setThreads(prev => prev.map(t => t.id === data.id ? { ...t, messages: [], media: [], unread: 0 } : t)); onClose(); notify('Conversation cleared'); }}>Clear conversation</button></div></div></Modal>;
  if (type === 'report') return <ReportPostForm data={data} onClose={onClose} />;
  return null;
}
export default function GlobalModals() {
  const { modal, closeModal, openModal, threads, notify } = useApp();
  const navigate = useNavigate();
  if (!modal) return null;
  const data = modal.data || {};
  switch (modal.type) {
    case 'compose': return <ComposeForm data={data} onClose={closeModal} />;
    case 'edit-profile': return <EditProfileForm onClose={closeModal} />;
    case 'new-message': return <NewMessageForm data={data} onClose={closeModal} />;
    case 'create-community': return <CreateCommunityForm onClose={closeModal} />;
    case 'post': return <PostDetail id={data.id} onClose={closeModal} />;
    case 'story': return <StoryViewer id={data.id} onClose={closeModal} />;
    case 'create-story': return <CreateStoryForm onClose={closeModal} />;
    case 'event': return <EventModal onClose={closeModal} />;
    case 'image': return <Modal title={data.alt || 'A closer look'} onClose={closeModal} wide className="image-modal"><img src={data.src} alt={data.alt || 'Shared image'} /><a className="image-download" href={data.src} download="chatra-image"><Download size={16} />Download image</a></Modal>;
    case 'gallery': { const thread = threads.find(t => t.id === data.threadId); const media = [...new Set([...(thread?.media || []), ...(thread?.messages.filter(m => m.type === 'image' && m.src).map(m => m.src!) || [])])]; return <Modal title="Your shared moments" onClose={closeModal} wide><div className="gallery-grid">{media.map((src, i) => <button key={`${src}-${i}`} onClick={() => openModal('image', { src, alt: 'Shared media' })}><img src={src} alt="Shared media" /></button>)}</div>{media.length === 0 && <EmptyState title="No shared media yet" description="Photos you share in this conversation will appear here." />}</Modal>; }
    case 'people': return <Modal title={data.kind === 'followers' ? 'Followers' : 'Following'} onClose={closeModal}><div className="modal-body people-modal">{people.filter(p => p.id !== (data.personId || 'bashir')).map(person => <div key={person.id}><Avatar src={person.avatar} alt={person.name} size={47} /><Link to={`/profile/${person.id}`} onClick={closeModal}><strong>{person.name}</strong><span>@{person.handle}</span></Link><FollowButton id={person.id} small /></div>)}<p className="form-note">A sample of this profile’s community.</p></div></Modal>;
    case 'help': return <HelpModal section={data.section || 'help'} onClose={closeModal} />;
    case 'about': return <Modal title="Real people. Brighter conversations." onClose={closeModal}><div className="modal-body about-modal"><Logo /><p>A social home for curious people, creative minds, and communities across Africa and beyond.</p><div className="about-features"><span><MessageCircle size={21} />Conversations that bring you closer</span><span><Users size={21} />Communities built around what you love</span><span><Heart size={21} />A little more of what matters to you</span></div><div className="settings-info"><Info size={20} /><p>An interactive prototype based on the supplied Chatra designs. Changes are saved on this device. Calls are simulated; there is no connected backend.</p></div><p className="image-credits">Photography adapted from the supplied designs, with Kigali photography from <a href="https://www.pexels.com/search/kigali/" target="_blank" rel="noreferrer">Pexels <ExternalLink size={12} /></a>.</p><button className="button primary" onClick={() => { closeModal(); navigate('/personalize'); }}><Palette size={17} />Make Chatra yours</button></div></Modal>;
    case 'account': return <Modal title="Your corner of Chatra" onClose={closeModal}><div className="modal-body account-modal">{[{ to: '/profile', label: 'Your profile', icon: UserRound }, { to: '/messages', label: 'Messages', icon: MessageCircle }, { to: '/bookmarks', label: 'Bookmarks', icon: Heart }, { to: '/personalize', label: 'Personalize your experience', icon: Palette }, { to: '/settings', label: 'Settings and privacy', icon: Settings }].map(item => <Link key={item.to} to={item.to} onClick={closeModal}><item.icon size={21} />{item.label}<ArrowRight size={17} /></Link>)}<button onClick={() => openModal('about')}><Info size={21} />About this prototype<ArrowRight size={17} /></button></div></Modal>;
    case 'share': return <Modal title="Share a little inspiration" onClose={closeModal}><div className="modal-body form-fields"><label>Link<input readOnly value={data.url} onFocus={e => e.target.select()} /></label><button className="button primary" onClick={() => { void navigator.clipboard.writeText(data.url).then(() => notify('Link copied')).catch(() => notify('Select the link above and copy it manually.')); }}><Copy size={17} />Copy link</button></div></Modal>;
    case 'call-info': return <Modal title="A preview of being together" onClose={closeModal}><div className="modal-body security-modal"><ShieldCheck size={43} /><h2>This is a demo call</h2><p>The participant imagery, connection status, captions, and screen sharing are simulated. No camera, microphone, or screen is accessed or recorded.</p><p>Try the controls to explore the interface. A production calling feature would connect to a real-time media service.</p><button className="button primary" onClick={closeModal}>Back to the call</button></div></Modal>;
    case 'feedback': return <Modal title="Thanks for making Chatra yours" onClose={closeModal}><div className="modal-body"><p>We’ve noted that you’re less interested in <strong>#{data.topic}</strong>. You can still explore it anytime.</p><p className="form-note">This prototype records topic feedback for the current session.</p><button className="button primary" onClick={() => { try { sessionStorage.setItem(`chatra:not-interested:${data.topic}`, 'true'); } catch { /* Optional feedback. */ } closeModal(); notify('Topic feedback noted'); }}>Done <Check size={17} /></button></div></Modal>;
    default: return <SimpleForms key={`${modal.type}-${data.id || ''}`} type={modal.type} data={data} onClose={closeModal} />;
  }
}