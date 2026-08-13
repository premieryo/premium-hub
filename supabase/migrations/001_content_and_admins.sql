create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.content_items (
  genre text not null check (genre in ('pokemon', 'onepiece', 'dragonball', 'beyblade', 'figure')),
  resource text not null check (resource in ('products', 'lottery', 'restock', 'ranking')),
  item_id text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (genre, resource, item_id)
);

create index if not exists content_items_genre_resource_idx
  on public.content_items (genre, resource);

alter table public.admin_users enable row level security;
alter table public.content_items enable row level security;

revoke all on public.admin_users from anon, authenticated;
revoke all on public.content_items from anon, authenticated;
grant select on public.admin_users to authenticated;
grant select on public.content_items to anon, authenticated;
grant insert, update, delete on public.content_items to authenticated;
grant all privileges on public.admin_users to service_role;
grant all privileges on public.content_items to service_role;

create policy "Admins can read own membership"
on public.admin_users for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Public can read content"
on public.content_items for select to anon, authenticated
using (true);

create policy "Admins can insert content"
on public.content_items for insert to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can update content"
on public.content_items for update to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can delete content"
on public.content_items for delete to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
