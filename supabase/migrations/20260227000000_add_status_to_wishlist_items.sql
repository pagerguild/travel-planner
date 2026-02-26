-- Add status column to wishlist_items table
-- Status tracks the lifecycle of a wishlist item: want → purchased → packed

alter table public.wishlist_items
  add column if not exists status text not null default 'want'
    constraint wishlist_items_status_check check (status in ('want', 'purchased', 'packed'));

-- Index for filtering by status
create index if not exists wishlist_items_status_idx
  on public.wishlist_items (status);
