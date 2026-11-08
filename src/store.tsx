import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Dispatch, SetStateAction, ReactNode } from 'react';
import { initialProfile, initialPosts, initialThreads, initialCommunities, initialNotifications, initialComments, defaultSettings, defaultPreferences } from './data';
import type { Profile, Post, Thread, Community, Notification, Comment, Preferences, Settings, ModalState, Story } from './types';

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
  posts: Post[]; setPosts: Dispatch<SetStateAction<Post[]>>;
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
};
const AppContext = createContext<Store | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useStoredState('profile', initialProfile);
  const [userStory, setUserStory] = useStoredState<Story | null>('my-story', null);
  const [posts, setPosts] = useStoredState('posts', initialPosts);
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
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notify = useCallback((message: string) => {
    clearTimeout(toastTimer.current); setToast(message);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    const handle = () => notify('Device storage is full. Your latest changes may not persist after a refresh.');
    window.addEventListener('chatra-storage-full', handle);
    return () => window.removeEventListener('chatra-storage-full', handle);
  }, [notify]);
  useEffect(() => {
    const theme = settings.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : settings.theme;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.accent = settings.accent;
    document.documentElement.dataset.font = settings.fontSize;
    document.documentElement.dataset.contrast = String(settings.highContrast);
    document.documentElement.dataset.motion = String(settings.reducedMotion);
  }, [settings]);
  const toggleLike = (id: string) => setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p));
  const toggleBookmark = (id: string) => {
    const post = posts.find(p => p.id === id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));
    notify(post?.bookmarked ? 'Post removed from bookmarks' : 'Saved to your bookmarks');
  };
  const toggleRepost = (id: string) => setPosts(prev => prev.map(p => p.id === id ? { ...p, reposted: !p.reposted, reposts: p.reposts + (p.reposted ? -1 : 1) } : p));
  const toggleFollow = (id: string) => {
    setFollowed(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };
  const toggleJoin = (id: string) => {
    const community = communities.find(c => c.id === id);
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, joined: !c.joined } : c));
    notify(community?.joined ? `You left ${community.name}` : `Welcome to ${community?.name}!`);
  };
  return <AppContext.Provider value={{
    profile, setProfile, userStory, setUserStory, posts, setPosts, threads, setThreads, communities, setCommunities,
    notifications, setNotifications, comments, setComments, followed, setFollowed, settings, setSettings,
    preferences, setPreferences, communityPosts, setCommunityPosts, modal,
    openModal: (type, data) => setModal({ type, data }), closeModal: () => setModal(null), toast, notify,
    toggleLike, toggleBookmark, toggleRepost, toggleFollow, toggleJoin,
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
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('Please choose an image file.')); return; }
    if (file.size > 12 * 1024 * 1024) { reject(new Error('Please choose an image smaller than 12 MB.')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read this image. Please try another.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('This image format is not supported.'));
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Image processing is unavailable.')); return; }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}