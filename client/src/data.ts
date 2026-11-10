import type { Person, Post, Thread, Community, Profile, Preferences, Settings, Notification, Comment } from './types';

export const people: Person[] = [
  { id: 'bashir', name: 'Bashir', handle: 'CodingWithBashir', avatar: '/images/bashir-profile.webp', role: 'Software developer', location: 'Kigali, Rwanda', online: true, bio: 'Building useful things with code.' },
  { id: 'amina', name: 'Amina', handle: 'aminadesigns', avatar: '/images/amina.webp', role: 'Product designer', location: 'Nairobi, Kenya', online: true, bio: 'Thoughtful design. Everyday inspiration. Creating a brighter digital world, one pixel at a time.' },
  { id: 'david', name: 'David', handle: 'davidcodes', avatar: '/images/david.webp', role: 'Developer', location: 'Nairobi, Kenya', online: true, bio: 'Open-source enthusiast. Turning coffee into useful little tools.' },
  { id: 'grace', name: 'Grace', handle: 'grace.photos', avatar: '/images/grace.webp', role: 'Photographer', location: 'Kigali, Rwanda', online: true, bio: 'Finding the extraordinary in ordinary moments. Stories through a lens.' },
  { id: 'theo', name: 'Theo', handle: 'theobuilds', avatar: '/images/theo.webp', role: 'Founder & builder', location: 'Kampala, Uganda', online: false, bio: 'Curious about technology, football, and the future we are building together.' },
];
export const getPerson = (id: string) => people.find(p => p.id === id) || people[0];
export const initialProfile: Profile = { name: 'Bashir', handle: 'CodingWithBashir', bio: 'Building useful things with code.', location: 'Kigali, Rwanda', website: '', avatar: '/images/bashir-profile.webp' };
export const initialPosts: Post[] = [
  { id: 'p-amina', authorId: 'amina', text: 'Working on a new design project today!\nHere’s a little behind the scenes. ✨', image: '/images/workspace.webp', time: '2h', likes: 342, comments: 24, reposts: 56, liked: true, tags: ['Design', 'AfricanCreators', 'BuildInPublic'] },
  { id: 'p-bashir', authorId: 'bashir', text: 'Just wrapped up a new feature for my side project.\nSmall progress every day adds up. 🚀', time: '4h', likes: 208, comments: 18, reposts: 32, tags: ['BuildInPublic', 'TechInAfrica'] },
  { id: 'p-grace', authorId: 'grace', text: 'Golden hour in Kigali never gets old. A little reminder to look up and take it all in. 📷', image: '/images/kigali.webp', time: '8h', likes: 210, comments: 15, reposts: 27, bookmarked: true, tags: ['Photography', 'AfricanCreators'] },
  { id: 'p-david', authorId: 'david', text: 'Just shipped a new feature! Excited to see how the community uses it. Feedback welcome! 🚀\n\nBuilding in public means celebrating the small wins, together.', time: '5h', likes: 98, comments: 36, reposts: 12, tags: ['TechInAfrica', 'BuildInPublic'] },
  { id: 'p-theo', authorId: 'theo', text: 'The best part of building something? The people you meet along the way.\n\nWho are you collaborating with this week? Let’s connect. 🌍', time: '1d', likes: 126, comments: 21, reposts: 14, tags: ['AfricanCreators', 'TechInAfrica'] },
  { id: 'c-weekly', authorId: 'amina', title: 'Weekly build thread', text: 'Share what you’re building, get feedback, find collaborators and celebrate progress. All levels are welcome!', time: '3 days ago', likes: 92, comments: 24, reposts: 18, pinned: true, communityId: 'kigali-devs', tags: ['BuildInPublic', 'TechInAfrica'] },
  { id: 'c-goals', authorId: 'david', title: 'Just shipped my first open source project 🎉', text: 'A lightweight tool to help track personal goals from the terminal.\nWould love your feedback and suggestions!', time: '1 day ago', likes: 64, comments: 16, reposts: 12, communityId: 'kigali-devs', tags: ['BuildInPublic', 'TechInAfrica'], attachment: { title: 'goals-cli', description: 'A simple CLI to track your goals and stay consistent.', url: 'https://github.com/topics/cli', image: '/images/goals-cli.webp' } },
  { id: 'p-pinned', authorId: 'bashir', text: 'Excited to share something I’ve been working on — Chatra!\n\nA social platform for real conversations, creators, and communities across Africa and beyond. Built with a focus on meaningful connections.', image: '/images/chatra-preview.webp', time: 'Oct 14, 2026', likes: 1200, comments: 64, reposts: 214, liked: true, bookmarked: true, pinned: true, tags: ['BuildInPublic', 'TechInAfrica'] },
];
export const trends = [
  { tag: 'BuildInPublic', count: '2.3K', category: 'Technology · Trending' },
  { tag: 'AfricanCreators', count: '4.8K', category: 'Creators · Trending in Africa' },
  { tag: 'TechInAfrica', count: '1.9K', category: 'Technology · Trending' },
  { tag: 'Photography', count: '3.1K', category: 'Art & culture · Trending' },
  { tag: 'Design', count: '1.6K', category: 'Design · Trending' },
];
export const initialThreads: Thread[] = [
  { id: 'amina', personId: 'amina', time: '10:24', unread: 2, media: ['/images/chatra-preview.webp', '/images/kigali.webp', '/images/workspace.webp', '/images/kigali-hills.webp', '/images/amina.webp', '/images/call-amina.webp'], messages: [
    { id: 'a1', sender: 'them', text: 'Hey Bashir! I saw the new profile design you shared. It looks amazing! 👏', time: '10:16' },
    { id: 'a2', sender: 'me', text: 'Thanks! I’ve been refining it based on the feedback from the team. Here are the latest screens for the profile page.', time: '10:18' },
    { id: 'a3', sender: 'me', text: 'The latest Chatra profile screens', type: 'image', src: '/images/chatra-preview.webp', time: '10:18' },
    { id: 'a4', sender: 'them', text: 'This is clean! I love the cover photo and the stats layout. The edit flow looks smooth too.', time: '10:21' },
    { id: 'a5', sender: 'them', text: 'Voice note · 0:18', type: 'audio', time: '10:22' },
    { id: 'a6', sender: 'me', text: 'Glad you like it! I’ll polish a few more details and share with the team later today.', time: '10:24' },
  ] },
  { id: 'david', personId: 'david', time: '09:41', unread: 2, messages: [
    { id: 'd1', sender: 'me', text: 'How is the new release coming along?', time: '09:30' },
    { id: 'd2', sender: 'them', text: 'That approach looks solid!', time: '09:38' },
    { id: 'd3', sender: 'them', text: 'Let’s catch up tomorrow.', time: '09:41' },
  ] },
  { id: 'grace', personId: 'grace', time: '08:17', unread: 1, messages: [
    { id: 'g1', sender: 'them', text: 'Found the perfect light on this morning’s walk. Sharing a few favorites!', time: '08:15' },
    { id: 'g2', sender: 'them', text: 'Kigali from above', type: 'image', src: '/images/kigali.webp', time: '08:17' },
  ] },
  { id: 'theo', personId: 'theo', time: 'Yesterday', unread: 0, messages: [
    { id: 't1', sender: 'me', text: 'Here’s the breakdown of the new feature.', time: '14:20' },
    { id: 't2', sender: 'them', text: 'Great breakdown! Totally agree.', time: '14:32' },
  ] },
  { id: 'product', name: 'Product Team', group: true, time: 'Yesterday', unread: 0, messages: [
    { id: 'pt1', sender: 'them', text: 'David: Pushed the latest build. Ready for a design review whenever you are!', time: '16:42' },
    { id: 'pt2', sender: 'me', text: 'Amazing. I’ll take a look this afternoon.', time: '16:45' },
  ] },
  { id: 'creators', name: 'Creators Hub', group: true, time: 'Mon', unread: 0, messages: [{ id: 'ch1', sender: 'them', text: 'Amina: Love this! 😍 Welcome to the community, Bashir.', time: '11:20' }] },
  { id: 'design', name: 'Design Circle', group: true, time: 'Mon', unread: 0, messages: [{ id: 'dc1', sender: 'them', text: 'Grace: Here are the assets for this week’s design challenge.', time: '09:10' }] },
  { id: 'football', name: 'Football Talk', group: true, time: 'Sun', unread: 0, messages: [{ id: 'ft1', sender: 'them', text: 'Theo: This game was intense. What a finish! ⚽', time: '20:12' }] },
];
export const threadName = (thread: Thread) => thread.name || getPerson(thread.personId || 'amina').name;
export const threadAvatar = (thread: Thread) => getPerson(thread.personId || 'amina').avatar;
export const initialCommunities: Community[] = [
  { id: 'kigali-devs', name: 'Kigali Developers', description: 'Build, learn and share with developers in Rwanda.', members: '2.4K', category: 'Technology', color: '#24dfcd', icon: 'code', joined: true, image: '/images/kigali-reference.webp' },
  { id: 'photography', name: 'Photography', description: 'See the world differently. Share your perspective, one frame at a time.', members: '8.1K', category: 'Art & culture', color: '#f3c873', icon: 'camera', image: '/images/kigali.webp' },
  { id: 'african-creators', name: 'African Creators', description: 'A home for bold ideas and the people bringing them to life across Africa.', members: '15.7K', category: 'Creators', color: '#b5a0f4', icon: 'palette', image: '/images/workspace.webp' },
  { id: 'startups', name: 'Tech & Startups', description: 'From the first idea to the next big thing. Let’s build together.', members: '12.4K', category: 'Technology', color: '#80b8f8', icon: 'rocket' },
  { id: 'book-club', name: 'The Reading Room', description: 'Good books, great conversations. Discover your next favorite read.', members: '1.2K', category: 'Lifestyle', color: '#efac8c', icon: 'book' },
];
export const initialNotifications: Notification[] = [
  { id: 'n1', personId: 'amina', kind: 'like', text: 'liked your post about building Chatra.', time: '2 min ago', read: false, postId: 'p-pinned' },
  { id: 'n2', personId: 'david', kind: 'follow', text: 'started following you.', time: '18 min ago', read: false },
  { id: 'n3', personId: 'grace', kind: 'comment', text: 'commented: “This is such a great idea. Can’t wait to try it!”', time: '1 hour ago', read: false, postId: 'p-pinned' },
  { id: 'n4', personId: 'theo', kind: 'repost', text: 'reposted your post.', time: '3 hours ago', read: true, postId: 'p-bashir' },
  { id: 'n5', personId: 'amina', kind: 'community', text: 'shared a new discussion in Kigali Developers.', time: '5 hours ago', read: true },
];
export const initialComments: Record<string, Comment[]> = {
  'p-amina': [
    { id: 'c1', authorId: 'grace', text: 'That workspace is a whole mood 😍 Love what you’re creating!', time: '1h' },
    { id: 'c2', authorId: 'david', text: 'The details make all the difference. Looking great!', time: '45 min' },
  ],
  'p-pinned': [
    { id: 'c3', authorId: 'grace', text: 'This is such a great idea. Can’t wait to try it!', time: '1h' },
    { id: 'c4', authorId: 'amina', text: 'Real connections are what make the internet special. Proud of this! 💚', time: '30 min' },
  ],
};
export const defaultSettings: Settings = {
  privateAccount: false, messagePermission: 'People you follow', mentionPermission: 'Everyone', activityStatus: true,
  pushNotifications: true, emailNotifications: true, messageNotifications: true, communityNotifications: true,
  theme: 'dark', accent: 'teal', fontSize: 'default', reducedMotion: false, highContrast: false,
  twoFactor: false, loginAlerts: true,
};
export const defaultPreferences: Preferences = { purpose: 'friends', language: 'English', region: 'Rwanda', completed: false };
export const meetupDate = (() => {
  const date = new Date();
  const days = (6 - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
})();