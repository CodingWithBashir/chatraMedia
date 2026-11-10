alter table public.profiles add column role text not null default '';
alter table public.posts add column tags text[] not null default '{}';
