create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null default 'New member',
  bio text not null default '',
  location text not null default '',
  website text not null default '',
  avatar_url text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9_.]{3,24}$')
);
create table public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text not null default '',
  category text not null default 'General',
  visibility text not null default 'public' check (visibility in ('public','private')),
  cover_url text,
  created_at timestamptz not null default now()
);
create table public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','moderator','member')),
  joined_at timestamptz not null default now(),
  primary key (community_id,user_id)
);
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  community_id uuid references public.communities(id) on delete set null,
  content text not null default '',
  image_url text,
  visibility text not null default 'public' check (visibility in ('public','followers','private')),
  poll_options jsonb,
  poll_votes jsonb,
  poll_duration text,
  poll_multiple boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(content) <= 500)
);
create index posts_created_at_idx on public.posts(created_at desc);
create index posts_user_id_idx on public.posts(user_id,created_at desc);
create table public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like','repost')),
  created_at timestamptz not null default now(),
  primary key (post_id,user_id,reaction_type)
);
create table public.bookmarks (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id,user_id)
);
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(content) between 1 and 500),
  created_at timestamptz not null default now()
);
create index comments_post_created_idx on public.comments(post_id,created_at);
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id,following_id),
  check (follower_id <> following_id)
);
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(name) between 1 and 48),
  description text not null default '',
  is_private boolean not null default false,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.list_members (
  list_id uuid not null references public.lists(id) on delete cascade,
  member_type text not null check (member_type in ('user','topic','community')),
  member_id text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (list_id,member_type,member_id)
);
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_url text not null,
  caption text not null default '',
  audience text not null default 'followers' check (audience in ('followers','close_friends','custom')),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now()
);
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text,
  is_group boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (conversation_id,user_id)
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(content) between 1 and 5000),
  attachment_url text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index messages_conversation_created_idx on public.messages(conversation_id,created_at);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null,
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index notifications_recipient_created_idx on public.notifications(recipient_id,created_at desc);
create table public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '',
  image_url text,
  scheduled_for timestamptz not null,
  published_post_id uuid references public.posts(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete set null,
  reason text not null,
  context text not null default '',
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);
create table public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id,username,display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username',''),'user_' || left(replace(new.id::text,'-',''),12)),
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''),nullif(new.raw_user_meta_data->>'name',''),split_part(coalesce(new.email,'Chatra member'),'@',1))
  ) on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.notify_post_reaction() returns trigger language plpgsql security definer set search_path = '' as $$
declare target_user uuid;
begin
  select user_id into target_user from public.posts where id = new.post_id;
  if target_user is not null and target_user <> new.user_id then
    insert into public.notifications(recipient_id,actor_id,kind,entity_type,entity_id) values(target_user,new.user_id,new.reaction_type,'post',new.post_id);
  end if;
  return new;
end;
$$;
create trigger on_post_reaction_created after insert on public.post_reactions for each row execute function public.notify_post_reaction();
create or replace function public.notify_new_comment() returns trigger language plpgsql security definer set search_path = '' as $$
declare target_user uuid;
begin
  select user_id into target_user from public.posts where id = new.post_id;
  if target_user is not null and target_user <> new.user_id then
    insert into public.notifications(recipient_id,actor_id,kind,entity_type,entity_id) values(target_user,new.user_id,'comment','post',new.post_id);
  end if;
  return new;
end;
$$;
create trigger on_comment_created after insert on public.comments for each row execute function public.notify_new_comment();
create or replace function public.notify_new_follower() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications(recipient_id,actor_id,kind,entity_type,entity_id) values(new.following_id,new.follower_id,'follow','profile',new.follower_id);
  return new;
end;
$$;
create trigger on_follow_created after insert on public.follows for each row execute function public.notify_new_follower();

alter table public.profiles enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.posts enable row level security;
alter table public.post_reactions enable row level security;
alter table public.bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.lists enable row level security;
alter table public.list_members enable row level security;
alter table public.stories enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.scheduled_posts enable row level security;
alter table public.moderation_reports enable row level security;
alter table public.user_settings enable row level security;

create policy profiles_read on public.profiles for select using (true);
create policy profiles_insert_self on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update_self on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy communities_read on public.communities for select using (visibility = 'public' or owner_id = (select auth.uid()) or exists(select 1 from public.community_members cm where cm.community_id = id and cm.user_id = (select auth.uid())));
create policy communities_insert_owner on public.communities for insert to authenticated with check (owner_id = (select auth.uid()));
create policy communities_update_owner on public.communities for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy communities_delete_owner on public.communities for delete to authenticated using (owner_id = (select auth.uid()));
create policy community_members_read on public.community_members for select using (exists(select 1 from public.communities c where c.id = community_id and (c.visibility='public' or c.owner_id=(select auth.uid()))) or user_id=(select auth.uid()));
create policy community_members_join_self on public.community_members for insert to authenticated with check (user_id = (select auth.uid()) and role = 'member');
create policy community_members_leave_self on public.community_members for delete to authenticated using (user_id = (select auth.uid()));
create policy posts_read_public on public.posts for select using (visibility = 'public' or user_id = (select auth.uid()));
create policy posts_insert_self on public.posts for insert to authenticated with check (user_id = (select auth.uid()));
create policy posts_update_self on public.posts for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy posts_delete_self on public.posts for delete to authenticated using (user_id = (select auth.uid()));
create policy reactions_read on public.post_reactions for select using (true);
create policy reactions_insert_self on public.post_reactions for insert to authenticated with check (user_id = (select auth.uid()));
create policy reactions_delete_self on public.post_reactions for delete to authenticated using (user_id = (select auth.uid()));
create policy bookmarks_read_self on public.bookmarks for select to authenticated using (user_id = (select auth.uid()));
create policy bookmarks_insert_self on public.bookmarks for insert to authenticated with check (user_id = (select auth.uid()));
create policy bookmarks_delete_self on public.bookmarks for delete to authenticated using (user_id = (select auth.uid()));
create policy comments_read on public.comments for select using (true);
create policy comments_insert_self on public.comments for insert to authenticated with check (user_id = (select auth.uid()));
create policy comments_delete_self on public.comments for delete to authenticated using (user_id = (select auth.uid()));
create policy follows_read on public.follows for select using (true);
create policy follows_insert_self on public.follows for insert to authenticated with check (follower_id = (select auth.uid()));
create policy follows_delete_self on public.follows for delete to authenticated using (follower_id = (select auth.uid()));
create policy lists_read on public.lists for select using (not is_private or user_id = (select auth.uid()));
create policy lists_insert_self on public.lists for insert to authenticated with check (user_id = (select auth.uid()));
create policy lists_update_self on public.lists for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy lists_delete_self on public.lists for delete to authenticated using (user_id = (select auth.uid()));
create policy list_members_read on public.list_members for select using (exists(select 1 from public.lists l where l.id = list_id and (not l.is_private or l.user_id = (select auth.uid()))));
create policy list_members_manage_owner on public.list_members for all to authenticated using (exists(select 1 from public.lists l where l.id = list_id and l.user_id = (select auth.uid()))) with check (exists(select 1 from public.lists l where l.id = list_id and l.user_id = (select auth.uid())));
create policy stories_read_active on public.stories for select using (expires_at > now());
create policy stories_insert_self on public.stories for insert to authenticated with check (user_id = (select auth.uid()));
create policy stories_delete_self on public.stories for delete to authenticated using (user_id = (select auth.uid()));
create policy conversations_read_member on public.conversations for select to authenticated using (exists(select 1 from public.conversation_members cm where cm.conversation_id = id and cm.user_id = (select auth.uid())));
create policy conversations_insert_self on public.conversations for insert to authenticated with check (created_by = (select auth.uid()));
create policy conversation_members_read_self on public.conversation_members for select to authenticated using (user_id = (select auth.uid()) or exists(select 1 from public.conversation_members mine where mine.conversation_id = conversation_id and mine.user_id = (select auth.uid())));
create policy conversation_members_insert_creator on public.conversation_members for insert to authenticated with check (exists(select 1 from public.conversations c where c.id = conversation_id and c.created_by = (select auth.uid())) or user_id = (select auth.uid()));
create policy conversation_members_delete_self on public.conversation_members for delete to authenticated using (user_id = (select auth.uid()));
create policy messages_read_member on public.messages for select to authenticated using (exists(select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = (select auth.uid())));
create policy messages_insert_member on public.messages for insert to authenticated with check (sender_id = (select auth.uid()) and exists(select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = (select auth.uid())));
create policy messages_update_sender on public.messages for update to authenticated using (sender_id = (select auth.uid())) with check (sender_id = (select auth.uid()));
create policy notifications_read_self on public.notifications for select to authenticated using (recipient_id = (select auth.uid()));
create policy notifications_update_self on public.notifications for update to authenticated using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));
create policy scheduled_posts_read_self on public.scheduled_posts for select to authenticated using (user_id = (select auth.uid()));
create policy scheduled_posts_insert_self on public.scheduled_posts for insert to authenticated with check (user_id = (select auth.uid()));
create policy scheduled_posts_update_self on public.scheduled_posts for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy scheduled_posts_delete_self on public.scheduled_posts for delete to authenticated using (user_id = (select auth.uid()));
create policy reports_read_self on public.moderation_reports for select to authenticated using (reporter_id = (select auth.uid()));
create policy reports_insert_self on public.moderation_reports for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy user_settings_read_self on public.user_settings for select to authenticated using (user_id = (select auth.uid()));
create policy user_settings_insert_self on public.user_settings for insert to authenticated with check (user_id = (select auth.uid()));
create policy user_settings_update_self on public.user_settings for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('chatra-media','chatra-media',true,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;
create policy chatra_media_public_read on storage.objects for select using (bucket_id='chatra-media');
create policy chatra_media_user_upload on storage.objects for insert to authenticated with check (bucket_id='chatra-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy chatra_media_user_update on storage.objects for update to authenticated using (bucket_id='chatra-media' and (storage.foldername(name))[1]=(select auth.uid())::text) with check (bucket_id='chatra-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy chatra_media_user_delete on storage.objects for delete to authenticated using (bucket_id='chatra-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
