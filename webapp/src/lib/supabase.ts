import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

export type DbWishlistItem = {
	id: string;
	description: string;
	status: 'want' | 'purchased' | 'packed';
	created_at: string;
};
