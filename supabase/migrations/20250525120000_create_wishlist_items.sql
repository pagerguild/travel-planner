-- Create wishlist_items table for storing user wishlist entries
-- Matches DbWishlistItem type in webapp/src/lib/supabase.ts

create table if not exists wishlist_items (
  id          uuid primary key default gen_random_uuid(),
  description text not null,
  status      text not null default 'want'
                check (status in ('want', 'purchased', 'packed')),
  created_at  timestamptz not null default now()
);

-- Index for ordering by created_at descending (most recent first)
create index if not exists wishlist_items_created_at_idx
  on wishlist_items (created_at desc);

-- Enable Row Level Security (open for now — auth can be added later)
alter table wishlist_items enable row level security;

-- Allow all operations for authenticated and anonymous users
-- (tighten with user-scoped policies when auth is wired up)
create policy "allow_all" on wishlist_items
  for all using (true) with check (true);
