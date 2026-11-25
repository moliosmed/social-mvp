-- Newsletter subscribers for Molios Empire
-- Run once in Supabase SQL editor (Database → SQL Editor → Run).
-- The site inserts with the ANON key, so no service-role key is needed here.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "anon can subscribe" on public.newsletter_subscribers;
create policy "anon can subscribe"
  on public.newsletter_subscribers
  for insert
  to anon
  with check (true);

-- Comments / notes: readers are intentionally denied to anon/authenticated;
-- only the service role (dashboard) reads this table.
