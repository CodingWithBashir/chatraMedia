export type Person = {
  id: string; name: string; handle: string; avatar: string; role: string;
  location: string; online?: boolean; bio: string;
};
export type Post = {
  id: string; authorId: string; text: string; image?: string; time: string;
  likes: number; comments: number; reposts: number; liked?: boolean;
  bookmarked?: boolean; reposted?: boolean; pinned?: boolean; tags: string[];
  communityId?: string; title?: string; attachment?: { title: string; description: string; url: string; image: string };
  pollOptions?: string[]; pollVotes?: number[]; pollVote?: number; pollDuration?: string; pollMultiple?: boolean;
  authorSnapshot?: { id: string; name: string; handle: string; avatar: string; role?: string; location?: string };
};
export type Message = {
  id: string; sender: 'me' | 'them'; text: string; time: string;
  type?: 'text' | 'image' | 'audio'; src?: string;
};
export type Thread = {
  id: string; personId?: string; name?: string; group?: boolean;
  time: string; unread: number; messages: Message[]; media?: string[];
};
export type Community = {
  id: string; name: string; description: string; members: string;
  category: string; color: string; icon: 'code' | 'camera' | 'palette' | 'rocket' | 'book' | 'globe';
  joined?: boolean; image?: string;
};
export type Profile = {
  name: string; handle: string; bio: string; location: string; website: string;
  avatar: string; cover?: string; role?: string;
};
export type Story = { text: string; image: string; createdAt: number };
export type Preferences = { purpose: string; language: string; region: string; completed: boolean };
export type Settings = {
  privateAccount: boolean; messagePermission: string; mentionPermission: string;
  activityStatus: boolean; pushNotifications: boolean; emailNotifications: boolean;
  messageNotifications: boolean; communityNotifications: boolean; theme: string;
  accent: string; fontSize: string; reducedMotion: boolean; highContrast: boolean;
  twoFactor: boolean; loginAlerts: boolean;
};
export type Notification = {
  id: string; personId: string; kind: 'like' | 'follow' | 'comment' | 'repost' | 'community';
  text: string; time: string; read: boolean; postId?: string;
};
export type Comment = { id: string; authorId: string; text: string; time: string; authorSnapshot?: { id: string; name: string; handle: string; avatar: string } };
export type ModalState = { type: string; data?: Record<string, string> } | null;