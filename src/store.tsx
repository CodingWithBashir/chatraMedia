import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Dispatch, SetStateAction, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { initialProfile, initialPosts, initialThreads, initialCommunities, initialNotifications, initialComments, defaultSettings, defaultPreferences, getPerson } from './data';
import type { Profile, Post, Thread, Community, Notification, Comment, Preferences, Settings, ModalState, Story } from './types';
import { isSupabaseConfigured, isUuid, supabase, uploadImageData } from './lib/supabase';

function useStoredState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try { const saved = localStorage.getItem(`chatra:v1:${key}`); return saved ? JSON.parse(saved) as T : initial; }
    catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(`chatra:v1:${key}`, JSON.stringify(value)); }
    catch { window.dispatchEvent(new CustomEvent('chatra-storage-full')); }
  }, [key, value]);
  return [value, setValue];
}

type Store = {
  profile: Profile; setProfile: Dispatch<SetStateAction<Profile>>;
  userStory: Story | null; setUserStory: Dispatch<SetStateAction<Story | null>>;
  posts: Post[]; setPosts: Dispatch<SetStateAction<Post[]>>; createPost: (post: Post) => Promise<void>;
  threads: Thread[]; setThreads: Dispatch<SetStateAction<Thread[]>>;
  communities: Community[]; setCommunities: Dispatch<SetStateAction<Community[]>>;
  notifications: Notification[]; setNotifications: Dispatch<SetStateAction<Notification[]>>;
  comments: Record<string, Comment[]>; setComments: Dispatch<SetStateAction<Record<string, Comment[]>>>;
  followed: string[]; setFollowed: Dispatch<SetStateAction<string[]>>;
  settings: Settings; setSettings: Dispatch<SetStateAction<Settings>>;
  preferences: Preferences; setPreferences: Dispatch<SetStateAction<Preferences>>;
  communityPosts: Record<string, Post[]>; setCommunityPosts: Dispatch<SetStateAction<Record<string, Post[]>>>;
  modal: ModalState; openModal: (type: string, data?: Record<string, string>) => void; closeModal: () => void;
  toast: string; notify: (message: string) => void;
  toggleLike: (id: string) => void; toggleBookmark: (id: string) => void; toggleRepost: (id: string) => void;
  toggleFollow: (id: string) => void; toggleJoin: (id: string) => void;
  session: Session | null; authLoading: boolean; backendConfigured: boolean; signOut: () => Promise<void>;
};
const AppContext = createContext<Store | null>(null);
const toRelativeTime = (date: string) => { const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000)); if (seconds < 60) return 'now'; if (seconds < 3600) return `${Math.floor(seconds / 60)}m`; if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`; return `${Math.floor(seconds / 86400)}d`; };

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useStoredState<Profile>('profile', initialProfile);
  const [userStory, setUserStory] = useStoredState<Story | null>('my-story', null);
  const [posts, setPosts] = useStoredState<Post[]>('posts', initialPosts);
  const [threads, setThreads] = useStoredState('threads', initialThreads);
  const [communities, setCommunities] = useStoredState('communities', initialCommunities);
  const [notifications, setNotifications] = useStoredState('notifications', initialNotifications);
  const [comments, setComments] = useStoredState('comments', initialComments);
  const [followed, setFollowed] = useStoredState('followed', ['grace', 'theo']);
  const [settings, setSettings] = useStoredState('settings', defaultSettings);
  const [preferences, setPreferences] = useStoredState('preferences', defaultPreferences);
  const [communityPosts, setCommunityPosts] = useStoredState('community-posts', {});
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hydratedProfileUser = useRef<string | null>(null);
  const notify = useCallback((message: string) => {
    clearTimeout(toastTimer.current); setToast(message);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setAuthLoading(false); } });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession); setAuthLoading(false);
      if (hydratedProfileUser.current !== nextSession?.user.id) hydratedProfileUser.current = null;
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const client=supabase;
    if (!client || authLoading) return;
    let active = true;
    const hydrate = async () => {
      const userId = session?.user.id;
      const [postResult, reactionResult, bookmarkResult, followResult, commentResult] = await Promise.all([
        client.from('posts').select('id,user_id,community_id,content,image_url,tags,poll_options,poll_votes,poll_duration,poll_multiple,created_at,profiles!posts_user_id_fkey(id,username,display_name,avatar_url,role,location)').eq('visibility','public').order('created_at',{ascending:false}).limit(80),
        client.from('post_reactions').select('post_id,user_id,reaction_type'),
        userId ? client.from('bookmarks').select('post_id').eq('user_id',userId) : Promise.resolve({data:[],error:null}),
        userId ? client.from('follows').select('following_id').eq('follower_id',userId) : Promise.resolve({data:[],error:null}),
        client.from('comments').select('post_id'),
      ]);
      if (!active) return;
      if (postResult.error) { console.warn('Chatra feed sync:', postResult.error.message); return; }
      const reactions = reactionResult.data || [];
      const bookmarkedIds = new Set((bookmarkResult.data || []).map((x: {post_id:string})=>x.post_id));
      const followedIds = (followResult.data || []).map((x: {following_id:string})=>x.following_id);
      const commentCounts=new Map<string,number>();for(const comment of commentResult.data||[])commentCounts.set(comment.post_id,(commentCounts.get(comment.post_id)||0)+1);
      const remotePosts: Post[] = (postResult.data || []).map((row: any) => {
        const p = row.profiles || {};
        const postReactions = reactions.filter((r: any)=>r.post_id===row.id);
        const authorId = row.user_id as string;
        const fallback = getPerson(authorId);
        const authorSnapshot = { id:authorId,name:p.display_name||fallback.name,handle:p.username||fallback.handle,avatar:p.avatar_url||fallback.avatar,role:p.role||fallback.role,location:p.location||fallback.location };
        return {id:row.id,authorId,text:row.content||'',image:row.image_url||undefined,time:toRelativeTime(row.created_at),likes:postReactions.filter((r:any)=>r.reaction_type==='like').length,comments:commentCounts.get(row.id)||0,reposts:postReactions.filter((r:any)=>r.reaction_type==='repost').length,liked:postReactions.some((r:any)=>r.user_id===userId&&r.reaction_type==='like'),reposted:postReactions.some((r:any)=>r.user_id===userId&&r.reaction_type==='repost'),bookmarked:bookmarkedIds.has(row.id),tags:row.tags||[],communityId:row.community_id||undefined,pollOptions:row.poll_options||undefined,pollVotes:row.poll_votes||undefined,pollDuration:row.poll_duration||undefined,pollMultiple:!!row.poll_multiple,authorSnapshot};
      });
      setPosts(previous=>[...remotePosts,...previous.filter(p=>!isUuid(p.id))]);
      if (userId) {
        const {data: profileRow,error:profileError}=await client.from('profiles').select('username,display_name,bio,location,website,avatar_url,cover_url,role').eq('id',userId).maybeSingle();
        if (active && profileRow) {
          setProfile({name:profileRow.display_name,handle:profileRow.username,bio:profileRow.bio,location:profileRow.location,website:profileRow.website,avatar:profileRow.avatar_url||initialProfile.avatar,cover:profileRow.cover_url||undefined,role:profileRow.role});
          hydratedProfileUser.current=userId;
        } else if (profileError) console.warn('Chatra profile sync:',profileError.message);
        setFollowed(followedIds);
      }
    };
    void hydrate().catch(error=>console.error('Chatra database sync failed:',error));
    return ()=>{active=false};
  },[authLoading,session?.user.id]);

  useEffect(() => {
    const client=supabase;
    if (!client || !session || hydratedProfileUser.current !== session.user.id) return;
    const username=profile.handle.replace(/^@/,'').slice(0,24);
    if (!/^[A-Za-z0-9_.]{3,24}$/.test(username)) return;
    void (async()=>{try{const avatarUrl=profile.avatar.startsWith('data:')?await uploadImageData(profile.avatar,session.user.id,'profile'):profile.avatar;const coverUrl=profile.cover?.startsWith('data:')?await uploadImageData(profile.cover,session.user.id,'profile'):profile.cover;const{error}=await client.from('profiles').upsert({id:session.user.id,username,display_name:profile.name,bio:profile.bio,location:profile.location,website:profile.website,avatar_url:avatarUrl,cover_url:coverUrl||null,role:profile.role||''},{onConflict:'id'});if(error)throw error;if(avatarUrl!==profile.avatar||coverUrl!==profile.cover)setProfile(prev=>({...prev,avatar:avatarUrl,cover:coverUrl||undefined}));}catch(error){notify(`Profile saved locally; database sync failed: ${error instanceof Error?error.message:'unknown error'}`)}})();
  },[profile,session?.user.id,notify]);

  const createPost = async (post: Post) => {
    const remoteAuthor = session?.user.id;
    const current = remoteAuthor ? {...post,authorId:remoteAuthor,authorSnapshot:{id:remoteAuthor,name:profile.name,handle:profile.handle,avatar:profile.avatar,role:profile.role,location:profile.location}} : post;
    setPosts(prev=>[current,...prev]);
    if (supabase && session && isUuid(post.id)) {
      try {
        const imageUrl = post.image?.startsWith('data:') ? await uploadImageData(post.image,session.user.id,'posts') : post.image;
        const {error}=await supabase.from('posts').insert({id:post.id,user_id:session.user.id,content:post.text,image_url:imageUrl||null,tags:post.tags,community_id:isUuid(post.communityId||'')?post.communityId:null,poll_options:post.pollOptions||null,poll_votes:post.pollVotes||null,poll_duration:post.pollDuration||null,poll_multiple:post.pollMultiple||false});
        if(error) throw error;
        if(imageUrl!==post.image) setPosts(prev=>prev.map(item=>item.id===post.id?{...item,image:imageUrl}:item));
      } catch(error) { notify(`Post is on this device, but database save failed: ${error instanceof Error?error.message:'unknown error'}`); }
    }
  };
  const toggleLike = (id: string) => {
    const post=posts.find(p=>p.id===id);if(!post)return;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p));
    if(supabase&&session&&isUuid(id)) void (post.liked?supabase.from('post_reactions').delete().eq('post_id',id).eq('user_id',session.user.id).eq('reaction_type','like'):supabase.from('post_reactions').insert({post_id:id,user_id:session.user.id,reaction_type:'like'})).then(({error})=>{if(error)notify(`Like sync failed: ${error.message}`)});
  };
  const toggleBookmark = (id: string) => {
    const post = posts.find(p => p.id === id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));
    if(supabase&&session&&isUuid(id)) void (post?.bookmarked?supabase.from('bookmarks').delete().eq('post_id',id).eq('user_id',session.user.id):supabase.from('bookmarks').insert({post_id:id,user_id:session.user.id})).then(({error})=>{if(error)notify(`Bookmark sync failed: ${error.message}`)});
    notify(post?.bookmarked ? 'Post removed from bookmarks' : 'Saved to your bookmarks');
  };
  const toggleRepost = (id: string) => {
    const post=posts.find(p=>p.id===id);if(!post)return;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, reposted: !p.reposted, reposts: p.reposts + (p.reposted ? -1 : 1) } : p));
    if(supabase&&session&&isUuid(id)) void (post.reposted?supabase.from('post_reactions').delete().eq('post_id',id).eq('user_id',session.user.id).eq('reaction_type','repost'):supabase.from('post_reactions').insert({post_id:id,user_id:session.user.id,reaction_type:'repost'})).then(({error})=>{if(error)notify(`Repost sync failed: ${error.message}`)});
  };
  const toggleFollow = (id: string) => {
    setFollowed(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    if(supabase&&session&&isUuid(id)) void (followed.includes(id)?supabase.from('follows').delete().eq('follower_id',session.user.id).eq('following_id',id):supabase.from('follows').insert({follower_id:session.user.id,following_id:id})).then(({error})=>{if(error)notify(`Follow sync failed: ${error.message}`)});
  };
  const toggleJoin = (id: string) => {
    const community = communities.find(c => c.id === id);
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, joined: !c.joined } : c));
    if(supabase&&session&&isUuid(id)) void (community?.joined?supabase.from('community_members').delete().eq('community_id',id).eq('user_id',session.user.id):supabase.from('community_members').insert({community_id:id,user_id:session.user.id})).then(({error})=>{if(error)notify(`Community membership sync failed: ${error.message}`)});
    notify(community?.joined ? `You left ${community.name}` : `Welcome to ${community?.name}!`);
  };
  const signOut=async()=>{if(supabase) await supabase.auth.signOut();setSession(null);notify('You have been signed out.');};
  useEffect(() => {
    const theme = settings.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : settings.theme;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.accent = settings.accent;
    document.documentElement.dataset.font = settings.fontSize;
    document.documentElement.dataset.contrast = String(settings.highContrast);
    document.documentElement.dataset.motion = String(settings.reducedMotion);
  }, [settings]);
  useEffect(() => {
    const handle = () => notify('Device storage is full. Your latest changes may not persist after a refresh.');
    window.addEventListener('chatra-storage-full', handle);
    return () => window.removeEventListener('chatra-storage-full', handle);
  }, [notify]);
  return <AppContext.Provider value={{
    profile, setProfile, userStory, setUserStory, posts, setPosts, createPost, threads, setThreads, communities, setCommunities,
    notifications, setNotifications, comments, setComments, followed, setFollowed, settings, setSettings,
    preferences, setPreferences, communityPosts, setCommunityPosts, modal,
    openModal: (type, data) => setModal({ type, data }), closeModal: () => setModal(null), toast, notify,
    toggleLike, toggleBookmark, toggleRepost, toggleFollow, toggleJoin, session, authLoading, backendConfigured:isSupabaseConfigured, signOut,
  }}>{children}</AppContext.Provider>;
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
export const formatCount = (count: number) => count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(count);
export const nowTime = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
export function readImage(file: File, maxSize = 1200): Promise<string> {
  if (!file.type.startsWith('image/')) return Promise.reject(new Error('Choose an image file.'));
  if (file.size > 8 * 1024 * 1024) return Promise.reject(new Error('Choose an image smaller than 8 MB.'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onerror = () => reject(new Error('Could not read this image.'));
    reader.onload = () => {
      const img = new Image(); img.onerror = () => reject(new Error('This image could not be decoded.'));
      img.onload = () => { const scale = Math.min(1, maxSize / Math.max(img.width, img.height)); const canvas = document.createElement('canvas'); canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale); canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/webp', 0.84)); };
      img.src = String(reader.result);
    }; reader.readAsDataURL(file);
  });
}
