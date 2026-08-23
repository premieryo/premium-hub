create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  genre text not null
    constraint price_history_genre_check
    check (genre in ('pokemon', 'onepiece', 'dragonball', 'beyblade', 'figure')),
  product_id text not null,
  price integer not null
    constraint price_history_price_check
    check (price > 0),
  shop text,
  product_url text,
  source text not null default 'yahoo',
  fetched_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists price_history_genre_product_fetched_at_idx
  on public.price_history (genre, product_id, fetched_at desc);

alter table public.price_history enable row level security;

revoke all on public.price_history from anon, authenticated;
grant select on public.price_history to anon, authenticated;
grant all privileges on public.price_history to service_role;

create policy "Public can read price history"
on public.price_history for select to anon, authenticated
using (true);
