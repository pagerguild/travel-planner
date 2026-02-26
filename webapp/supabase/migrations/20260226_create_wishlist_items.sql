-- Migration: create wishlist_items table
-- Note: this table already exists in the hosted Supabase project with columns:
--   id uuid primary key default gen_random_uuid()
--   description text not null
--   created_at timestamptz default now()
--
-- This file documents the expected schema for local development / future envs.

create table if not exists public.wishlist_items (
  id          uuid        primary key default gen_random_uuid(),
  description text        not null,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security (open policy for now — auth to be added later)
alter table public.wishlist_items enable row level security;

create policy "Allow all for now"
  on public.wishlist_items
  for all
  using (true)
  with check (true);
