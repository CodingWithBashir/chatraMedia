create table public.list_follows (
  list_id uuid not null references public.lists(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (list_id,user_id)
);
alter table public.list_follows enable row level security;
create policy list_follows_read on public.list_follows for select using (exists(select 1 from public.lists l where l.id=list_id and (not l.is_private or l.user_id=(select auth.uid()))) or user_id=(select auth.uid()));
create policy list_follows_insert_self on public.list_follows for insert to authenticated with check (user_id=(select auth.uid()) and exists(select 1 from public.lists l where l.id=list_id and not l.is_private));
create policy list_follows_delete_self on public.list_follows for delete to authenticated using (user_id=(select auth.uid()));
