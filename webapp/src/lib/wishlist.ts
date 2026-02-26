export type ItemStatus = 'want' | 'purchased' | 'packed';

export type WishlistItem = {
	id: string;
	description: string;
	created_at: number;
	// Derived client-side from description
	name: string;
	status: ItemStatus;
	actual_price?: number;
	weight_g?: number;
};

/**
 * Parse a natural language description into a WishlistItem.
 * The description is stored as-is; the name is the first sentence/line.
 */
export function parseWishlistItem(raw: string): WishlistItem {
	const description = raw.trim();
	if (!description) {
		throw new Error('Description cannot be empty');
	}
	// Name = first sentence or first 60 chars, whichever is shorter
	const firstSentence = description.split(/[.\n]/)[0].trim();
	const name = firstSentence.length > 60 ? firstSentence.slice(0, 60) : firstSentence;

	return {
		id: crypto.randomUUID(),
		description,
		name,
		status: 'want',
		created_at: Date.now()
	};
}

/** Format a price in USD cents as a dollar string, e.g. 1999 → "$19.99" */
export function formatPrice(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}
