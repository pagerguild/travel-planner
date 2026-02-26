-- Migration: add status, actual_price, and weight_g to wishlist_items
-- Adds purchase tracking fields required by issue #34

alter table public.wishlist_items
  add column if not exists status      text        not null default 'want'
                                       check (status in ('want', 'purchased', 'packed')),
  add column if not exists actual_price integer     null,   -- stored in USD cents
  add column if not exists weight_g    integer     null;   -- weight in grams
