import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, UsersRound, FilePenLine, Users, Check, Globe2, MapPin, ChevronDown, Palette } from 'lucide-react';
import { useApp } from '../store';
import { PostCard } from '../components/Post';

const purposes = [
  { id: 'friends', title: 'Connect with friends', description: 'Keep in touch, chat and share moments with people you know.', icon: UsersRound, posts: ['p-amina', 'p-grace', 'p-theo'] },
  { id: 'work', title: 'Share my work', description: 'Showcase your projects, ideas and creativity to a wider audience.', icon: FilePenLine, posts: ['p-david', 'p-amina', 'p-bashir'] },
  { id: 'communities', title: 'Find communities', description: 'Join spaces around your interests and meet like-minded people.', icon: Users, posts: ['p-theo', 'p-grace', 'p-david'] },
];
export default function Personalize() {
  const { preferences, setPreferences, posts, notify } = useApp();
  const [purpose, setPurpose] = useState(preferences.purpose);
  const [language, setLanguage] = useState(preferences.language);
  const [region, setRegion] = useState(preferences.region);
  const navigate = useNavigate();
  const selected = purposes.find(p => p.id === purpose) || purposes[0];
  const finish = (skip = false) => {
    setPreferences({ purpose, language, region, completed: !skip });
    notify(skip ? 'You can personalize Chatra anytime in Settings' : 'Your feed, a little more you. Preferences saved!');
    navigate('/');
  };
  return <div className="personalize-page"><Link to="/" className="back-link"><ArrowLeft size={19} />Back to home</Link><div className="personalize-layout"><div className="personalize-main"><span className="personalize-eyebrow"><Palette size={16} />A SPACE THAT FEELS LIKE YOU</span><h1>How will you use<br className="personalize-title-break" /> Chatra?</h1><p className="personalize-description">Tell us what matters most to you. We’ll personalize your experience, show you relevant content, and suggest people and communities.</p><div className="purpose-options" role="radiogroup" aria-label="How will you use Chatra">{purposes.map(item => <button key={item.id} role="radio" aria-checked={purpose === item.id} className={`purpose-card ${purpose === item.id ? 'selected' : ''}`} onClick={() => setPurpose(item.id)}><div className="purpose-card-top"><item.icon size={34} strokeWidth={1.5} /><span className="purpose-radio">{purpose === item.id && <Check size={14} strokeWidth={3} />}</span></div><h2>{item.title}</h2><p>{item.description}</p></button>)}</div><div className="personalize-fields"><label>Preferred language<span className="select-with-icon"><Globe2 size={21} /><select value={language} onChange={e => setLanguage(e.target.value)} aria-label="Preferred language">{['English', 'French', 'Kinyarwanda', 'Swahili'].map(lang => <option key={lang}>{lang}</option>)}</select><ChevronDown size={18} /></span></label><label>Regional setting<span className="select-with-icon"><MapPin size={21} /><select value={region} onChange={e => setRegion(e.target.value)} aria-label="Regional setting">{['Rwanda', 'Kenya', 'Uganda', 'Nigeria', 'South Africa', 'Ghana', 'Other'].map(country => <option key={country}>{country}</option>)}</select><ChevronDown size={18} /></span></label></div><div className="personalize-actions"><button className="button primary" onClick={() => finish()}>Continue <ArrowRight size={20} /></button><button className="button secondary" onClick={() => finish(true)}>Skip for now</button></div><p className="personalize-note">You can change these anytime in Settings. This preview stays in English.</p></div><aside className="panel personalized-preview"><div className="preview-heading"><h2>Your personalized feed</h2><p>A preview of what you’ll see on Chatra.</p></div><div className="preview-posts">{selected.posts.map(id => { const post = posts.find(p => p.id === id); return post ? <PostCard key={`${purpose}-${id}`} post={post} /> : null; })}</div><div className="preview-footer"><span className="status-dot" />A little more of what you love.</div></aside></div></div>;
}