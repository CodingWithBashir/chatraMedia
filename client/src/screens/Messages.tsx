import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SquarePen, Search, Settings, MessageCircle, Phone, Video, Info, ArrowLeft, ChevronRight, ChevronLeft, X, Bell, Image as ImageIcon, MoreHorizontal, Paperclip, Smile, Mic, Send, CheckCheck, Play, Pause, Inbox, MapPin, VolumeX, Trash2 } from 'lucide-react';
import type { Message, Thread } from '../types';
import { useApp, nowTime, uid, readImage } from '../store';
import { getPerson, threadName } from '../data';
import { Avatar, GroupAvatar, IconButton, SearchInput, EmptyState, Menu, Toggle } from './../components/UI';

function VoiceNote({ message }: { message: Message }) {
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { notify } = useApp();
  useEffect(() => () => clearTimeout(timer.current), []);
  const toggle = () => {
    if (message.src && audio.current) {
      if (playing) audio.current.pause(); else void audio.current.play().catch(() => notify('This audio file could not be played.'));
      setPlaying(!playing);
    } else {
      setPlaying(!playing);
      if (!playing) { notify('Sample voice note · connect an audio source to play a real recording.'); timer.current = setTimeout(() => setPlaying(false), 18000); }
      else clearTimeout(timer.current);
    }
  };
  return <div className={`voice-note ${playing ? 'playing' : ''}`}><button aria-label={playing ? 'Pause voice note' : 'Play voice note'} onClick={toggle}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button><div className="waveform" aria-hidden="true">{Array.from({ length: 34 }, (_, i) => <i key={i} style={{ height: `${8 + ((i * 17 + 7) % 25)}px`, animationDelay: `${i * 0.05}s` }} />)}</div><span>{message.src ? 'Audio' : '0:18'}</span>{message.src && <audio ref={audio} src={message.src} onEnded={() => setPlaying(false)} />}</div>;
}
function ConversationRow({ thread, active }: { thread: Thread; active: boolean }) {
  const person = getPerson(thread.personId || 'amina');
  const last = thread.messages[thread.messages.length - 1];
  const preview = last ? (last.type === 'image' ? 'Sent a photo' : last.type === 'audio' ? 'Sent a voice note' : last.text) : 'Start a conversation';
  return <Link to={`/messages/${thread.id}`} className={`conversation-row ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}>{thread.group ? <GroupAvatar size={51} /> : <Avatar src={person.avatar} alt={person.name} size={51} online={person.online} />}<span className="conversation-row-content"><span className="conversation-row-top"><strong>{threadName(thread)}</strong><time>{thread.time}</time></span><span className="conversation-row-bottom"><span className="conversation-preview">{preview}</span>{thread.unread > 0 && <span className={`unread-count ${thread.id === 'amina' ? 'accent' : ''}`}>{thread.unread}</span>}</span></span></Link>;
}
export default function Messages() {
  const { id } = useParams();
  const { threads, setThreads, profile, openModal, notify, settings } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showInfo, setShowInfo] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [conversationSearch, setConversationSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [muted, setMuted] = useState<Record<string, boolean>>(() => { try { return JSON.parse(localStorage.getItem('chatra:v1:muted') || '{}'); } catch { return {}; } });
  const active = threads.find(t => t.id === id);
  const person = getPerson(active?.personId || 'amina');
  const bottom = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const previousThread = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (active) {
      setThreads(prev => prev.map(t => t.id === active.id && t.unread ? { ...t, unread: 0 } : t));
      setDraft(''); setConversationSearch(''); setSearchOpen(false); setEmojiOpen(false);
    }
  }, [id]);
  useEffect(() => {
    if (previousThread.current !== id) { bottom.current?.scrollIntoView({ behavior: 'instant' }); previousThread.current = id; }
    else bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [id, active?.messages.length]);
  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);
  useEffect(() => { try { localStorage.setItem('chatra:v1:muted', JSON.stringify(muted)); } catch { /* Preferences remain available for this session. */ } }, [muted]);
  const filtered = threads.filter(t => (filter !== 'unread' || t.unread > 0) && `${threadName(t)} ${t.messages.map(m => m.text).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const addMessage = (message: Omit<Message, 'id' | 'sender' | 'time'>) => {
    if (!active) return;
    const next: Message = { ...message, id: uid(), sender: 'me', time: nowTime() };
    setThreads(prev => prev.map(t => t.id === active.id ? { ...t, messages: [...t.messages, next], time: next.time, unread: 0 } : t));
  };
  const send = () => { if (!draft.trim() || !active) return; addMessage({ text: draft.trim() }); setDraft(''); setEmojiOpen(false); };
  const attach = async (file?: File, audio = false) => {
    if (!file || !active) return;
    try {
      if (audio) {
        if (!file.type.startsWith('audio/')) throw new Error('Please choose an audio file.');
        if (file.size > 2 * 1024 * 1024) throw new Error('Choose an audio clip smaller than 2 MB.');
        const src = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
        addMessage({ text: file.name, type: 'audio', src });
      } else { const src = await readImage(file, 900); addMessage({ text: file.name, type: 'image', src }); }
    } catch (error) { notify(error instanceof Error ? error.message : 'Could not attach this file.'); }
    if (fileInput.current) fileInput.current.value = '';
    if (audioInput.current) audioInput.current.value = '';
  };
  const media = active ? [...new Set([...(active.media || []), ...active.messages.filter(m => m.type === 'image' && m.src).map(m => m.src!)])] : [];
  const visibleMessages = active?.messages.filter(m => !conversationSearch || m.text.toLowerCase().includes(conversationSearch.toLowerCase())) || [];
  return <div className={`messages-workspace ${active ? 'has-active' : ''} ${active && showInfo ? 'with-info' : ''}`}><section className="inbox-panel panel" aria-label="Messages inbox"><div className="inbox-heading"><h1>Messages</h1><IconButton label="New message" onClick={() => openModal('new-message')}><SquarePen size={23} /></IconButton></div><SearchInput value={query} onChange={setQuery} placeholder="Search messages..." /><div className="inbox-filters">{[{ id: 'all', label: 'All' }, { id: 'unread', label: 'Unread' }, { id: 'requests', label: 'Requests' }].map(item => <button key={item.id} className={`chip ${filter === item.id ? 'active' : ''}`} onClick={() => setFilter(item.id)} aria-pressed={filter === item.id}>{item.label}</button>)}</div><div className="conversation-list">{filter === 'requests' ? <EmptyState icon={<Inbox size={28} />} title="No message requests" description="When someone new reaches out, you’ll find their message here." /> : filtered.map(thread => <ConversationRow key={thread.id} thread={thread} active={thread.id === id} />)}{filter !== 'requests' && filtered.length === 0 && <EmptyState icon={filter === 'unread' ? <CheckCheck size={28} /> : <Search size={28} />} title={filter === 'unread' ? 'All caught up' : 'No conversations found'} description={filter === 'unread' ? 'You’ve read all your messages.' : 'Try a different name or keyword.'} />}</div><div className="inbox-footer"><span className="status-dot" />Your conversations, all in one place.</div></section>
    {active ? <><section className="chat-panel panel" aria-label={`Conversation with ${threadName(active)}`}><header className="chat-header"><IconButton label="Back to inbox" className="chat-back" onClick={() => navigate('/messages')}><ArrowLeft size={21} /></IconButton><Link to={active.group ? '/communities' : `/profile/${person.id}`} className="chat-person">{active.group ? <GroupAvatar size={43} /> : <Avatar src={person.avatar} alt={person.name} size={43} />}<span><strong>{threadName(active)}</strong><span>{active.group ? 'Group conversation' : <><i className="status-dot" />{person.online && settings.activityStatus ? 'Online' : 'Last seen recently'}</>}</span></span></Link><div className="chat-header-actions"><IconButton label="Start audio call" onClick={() => navigate(`/call/${active.id}?mode=audio`)}><Phone size={20} /></IconButton><IconButton label="Start video call" onClick={() => navigate(`/call/${active.id}`)}><Video size={21} /></IconButton><IconButton label="Search in conversation" className={searchOpen ? 'active' : ''} onClick={() => { setSearchOpen(!searchOpen); setConversationSearch(''); }}><Search size={20} /></IconButton><IconButton label={showInfo ? 'Hide conversation details' : 'Show conversation details'} className={showInfo ? 'active' : ''} onClick={() => setShowInfo(!showInfo)}><Info size={21} /></IconButton></div></header>{searchOpen && <div className="chat-search"><div><input ref={searchInput} aria-label="Search conversation messages" placeholder={`Search in ${threadName(active)}’s conversation...`} value={conversationSearch} onChange={e => setConversationSearch(e.target.value)} /></div><span>{visibleMessages.length} results</span><IconButton label="Close conversation search" onClick={() => { setSearchOpen(false); setConversationSearch(''); }}><X size={17} /></IconButton></div>}<div className="chat-messages"><div className="date-divider"><span>Today</span></div>{visibleMessages.map(message => <div key={message.id} className={`message-line ${message.sender === 'me' ? 'outgoing' : 'incoming'}`}>{message.sender === 'them' && (active.group ? <GroupAvatar size={30} /> : <Avatar src={person.avatar} alt={person.name} size={30} />)}<div className="message-content">{message.type === 'image' ? <button className="message-image" onClick={() => openModal('image', { src: message.src!, alt: message.text })}><img src={message.src} alt={message.text} /></button> : message.type === 'audio' ? <div className="message-bubble audio-bubble"><VoiceNote message={message} /></div> : <div className="message-bubble"><p>{message.text}</p></div>}<div className="message-time"><time>{message.time}</time>{message.sender === 'me' && <CheckCheck size={16} aria-label="Saved on this device" />}</div></div></div>)}{conversationSearch && visibleMessages.length === 0 && <EmptyState title="No matching messages" description="Try a different word or clear your search." />}<div ref={bottom} /></div><div className="chat-composer-area">{emojiOpen && <div className="emoji-picker">{['1F60A','1F49A','1F389','1F44F','1F525','2728','1F64C','1F680','1F60D','1F44D','1F30D','2615'].map(code => String.fromCodePoint(parseInt(code,16))).map(emoji => <button key={emoji} aria-label={`Add ${emoji}`} onClick={() => setDraft(prev => prev + emoji)}>{emoji}</button>)}</div>}<div className="chat-composer"><IconButton label="Attach a photo" onClick={() => fileInput.current?.click()}><Paperclip size={21} /></IconButton><textarea rows={1} value={draft} onChange={e => setDraft(e.target.value)} placeholder={`Message ${threadName(active)}...`} aria-label={`Message ${threadName(active)}`} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} /><div className="chat-composer-tools"><IconButton label="Choose an emoji" onClick={() => setEmojiOpen(!emojiOpen)}><Smile size={21} /></IconButton><IconButton label="Attach a voice note" onClick={() => audioInput.current?.click()}><Mic size={21} /></IconButton><button className="send-button" aria-label="Send message" disabled={!draft.trim()} onClick={send}><Send size={21} /></button></div></div><span className="composer-hint">Enter to send · Shift + Enter for a new line</span></div><input ref={fileInput} type="file" accept="image/*" hidden onChange={e => void attach(e.target.files?.[0])} /><input ref={audioInput} type="file" accept="audio/*" hidden onChange={e => void attach(e.target.files?.[0], true)} /></section>
    {showInfo && <aside className="conversation-info panel"><div className="info-top"><IconButton label="Hide details" onClick={() => setShowInfo(false)}><ChevronLeft size={19} /></IconButton><IconButton label="Close details" onClick={() => setShowInfo(false)}><X size={19} /></IconButton></div><div className="info-person"><Avatar src={active.group ? '/images/amina.webp' : person.avatar} alt={person.name} size={112} online={person.online} /><h2>{threadName(active)}</h2><span className="muted">@{active.group ? threadName(active).toLowerCase().replace(/\s/g, '') : person.handle}</span><p>{active.group ? 'A space for the team' : person.role}</p><span className="info-location"><MapPin size={16} />{person.location}</span><Link className="button secondary" to={active.group ? '/communities' : `/profile/${person.id}`}>View {active.group ? 'community' : 'profile'}</Link></div><div className="info-options"><button onClick={() => setSearchOpen(true)}><Search size={20} /><span>Search in conversation</span></button><button onClick={() => openModal('gallery', { threadId: active.id })}><ImageIcon size={20} /><span>Shared media</span><span className="info-count">{media.length}</span><ChevronRight size={17} /></button><div className="info-toggle"><Bell size={20} /><span>Notifications</span><Toggle checked={!muted[active.id]} onChange={value => setMuted(prev => ({ ...prev, [active.id]: !value }))} label="Conversation notifications" /></div><Menu label="More conversation options" items={[{ label: muted[active.id] ? 'Unmute conversation' : 'Mute conversation', icon: <VolumeX size={17} />, onClick: () => setMuted(prev => ({ ...prev, [active.id]: !prev[active.id] })) }, { label: 'Clear conversation', icon: <Trash2 size={17} />, danger: true, onClick: () => openModal('clear-chat', { id: active.id }) }]}><MoreHorizontal size={20} /><span>More options</span><ChevronRight size={17} /></Menu></div><div className="info-media"><div className="card-heading"><h3>Shared media</h3><button className="text-link" onClick={() => openModal('gallery', { threadId: active.id })}>View all</button></div>{media.length ? <div className="shared-media-grid">{media.slice(0, 6).map((src, i) => <button key={`${src}-${i}`} onClick={() => openModal('image', { src, alt: 'Shared media' })}><img src={src} alt="Shared media" /></button>)}</div> : <p className="muted">Photos you share will appear here.</p>}</div><div className="info-privacy"><Avatar src={profile.avatar} size={22} /><span>A little space for a good conversation.</span></div></aside>}</> : <section className="panel messages-empty"><IconButton label="Message preferences" className="messages-settings" onClick={() => navigate('/settings?section=privacy')}><Settings size={23} /></IconButton><EmptyState icon={<div className="conversation-illustration"><MessageCircle size={94} strokeWidth={1.25} /><MessageCircle size={65} strokeWidth={1.4} /></div>} title="Your conversations start here" description="Choose a chat or start a new message."><button className="button primary" onClick={() => openModal('new-message')}><SquarePen size={20} />New message</button></EmptyState><span className="messages-empty-footer">Real people. Brighter conversations.</span></section>}
  </div>;
}