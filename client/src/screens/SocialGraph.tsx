import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, ChevronDown, MapPin, SlidersHorizontal, Users } from 'lucide-react';
import { people, getPerson } from '../data';
import { useApp } from '../store';
import { Avatar, EmptyState, SearchInput } from '../components/UI';
import { FollowButton, SuggestionsCard } from '../components/Rail';
import { RightFooter } from '../components/Layout';
import type { Person } from '../types';

const extraPeople: Person[] = [
  { id:'laila',name:'Laila',handle:'lailacreates',avatar:'/images/amina.webp',role:'UI/UX designer',location:'Kigali, Rwanda',bio:'Designing for people.' },
  { id:'eric',name:'Eric',handle:'ericwrites',avatar:'/images/david.webp',role:'Writer',location:'Nairobi, Kenya',bio:'Ideas for a more connected world.' },
  { id:'nadia',name:'Nadia',handle:'nadiaphoto',avatar:'/images/grace.webp',role:'Photographer',location:'Kigali, Rwanda',bio:'Telling stories, one photo at a time.' },
  { id:'samuel',name:'Samuel',handle:'samueldev',avatar:'/images/theo.webp',role:'Software engineer',location:'Kampala, Uganda',bio:'Building better tools for the web.' },
  { id:'marie',name:'Marie',handle:'mariecodes',avatar:'/images/amina-design.webp',role:'Software engineer',location:'Kigali, Rwanda',bio:'Curious about technology and people.' },
  { id:'kevin',name:'Kevin',handle:'kevinnjau',avatar:'/images/bashir.webp',role:'Product designer',location:'Nairobi, Kenya',bio:'Making useful things feel simple.' },
];
const allPeople = [...people.slice(1), ...extraPeople];
export default function SocialGraph(){
  const {id='bashir',view='followers'}=useParams(); const navigate=useNavigate();
  const {profile,followed,toggleFollow}=useApp(); const [query,setQuery]=useState(''); const [filter,setFilter]=useState<'Followers'|'Following'|'Mutuals'>(view==='following'?'Following':'Followers'); const [sort,setSort]=useState('Most recent');
  const own=id==='bashir'; const user=own?{name:profile.name,handle:profile.handle,avatar:profile.avatar,location:profile.location}:getPerson(id);
  const following=allPeople.filter((p,i)=>followed.includes(p.id)||(!followed.length&&i<3));
  const followers=allPeople.slice(0,id==='bashir'?7:5); const mutual=followers.filter(p=>following.some(f=>f.id===p.id));
  const source=filter==='Followers'?followers:filter==='Following'?following:mutual;
  const shown=useMemo(()=>source.filter(p=>`${p.name} ${p.handle} ${p.role} ${p.location}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==='Name A–Z'?a.name.localeCompare(b.name):0),[source,query,sort]);
  const countFollowing=own?'284':'412'; const countFollowers=own?'1,248':id==='amina'?'3.8K':'842';
  return <div className="social-graph-layout"><div className="social-graph-main"><button className="back-link social-back" onClick={()=>navigate(`/profile${own?'':`/${id}`}`)}><ArrowLeft size={18}/>{user.name} / {filter}</button><section className="panel graph-profile"><Avatar src={user.avatar} alt={user.name} size={76}/><div><h1>{user.name}</h1><span>@{user.handle}</span><p>{own?profile.bio:getPerson(id).bio}</p><div><span><MapPin size={15}/>{user.location}</span><span>▦ Joined October 2026</span></div></div>{own&&<Link className="button secondary small" to="/profile/edit">Edit profile</Link>}</section><div className="graph-stats"><button onClick={()=>setFilter('Following')}><strong>{countFollowing}</strong> Following</button><button onClick={()=>setFilter('Followers')}><strong>{countFollowers}</strong> Followers</button></div><div className="graph-tabs"><button className={filter==='Followers'?'active':''} onClick={()=>{setFilter('Followers');navigate(`/profile/${id}/followers`);}}>Followers <small>{countFollowers}</small></button><button className={filter==='Following'?'active':''} onClick={()=>{setFilter('Following');navigate(`/profile/${id}/following`);}}>Following <small>{countFollowing}</small></button><button className={filter==='Mutuals'?'active':''} onClick={()=>setFilter('Mutuals')}>Mutuals <small>{mutual.length}</small></button></div><div className="graph-search-row"><SearchInput value={query} onChange={setQuery} placeholder={`Search ${filter.toLowerCase()}...`}/><label className="graph-sort"><SlidersHorizontal size={17}/><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort people"><option>Most recent</option><option>Name A–Z</option></select><ChevronDown size={15}/></label></div><div className="graph-people panel">{shown.map(person=><div className="graph-person" key={person.id}><Link to={`/profile/${person.id}`}><Avatar src={person.avatar} alt={person.name} size={54}/></Link><Link className="graph-person-main" to={`/profile/${person.id}`}><strong>{person.name}</strong><span>@{person.handle}</span><small>{person.role} · {person.location.split(',')[0]}</small></Link>{filter==='Followers'&&<span className="follows-you">Follows you</span>}<FollowButton id={person.id} small/><button className="icon-button graph-notify" aria-label={`Toggle notifications for ${person.name}`} onClick={()=>toggleFollow(person.id)}><Bell size={17}/></button></div>)}{shown.length===0&&<EmptyState icon={<Users size={31}/>} title="No matches here" description="Try another name or username."/>}</div></div><aside className="right-rail graph-rail">{filter==='Followers'&&<section className="panel mutual-card"><h2>Mutual connections</h2><p>{mutual.length} people you both follow</p>{mutual.slice(0,4).map(p=><div className="mutual-row" key={p.id}><Avatar src={p.avatar} alt={p.name} size={44}/><span><strong>{p.name}</strong><small>@{p.handle}</small><small>{p.role} · {p.location.split(',')[0]}</small></span><FollowButton id={p.id} small/></div>)}</section>}<SuggestionsCard limit={4}/><RightFooter/></aside></div>;
}
