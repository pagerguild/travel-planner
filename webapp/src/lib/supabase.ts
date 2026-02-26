import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

export type DbWishlistItem = {
	id: string;
	description: string;
	created_at: string;
	status: 'want' | 'purchased' | 'packed';
	actual_price: number | null;
	weight_g: number | null;
};
