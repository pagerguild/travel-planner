import { describe, it, expect } from 'vitest';
import { parseWishlistItem, type WishlistItem } from './wishlist.js';

describe('parseWishlistItem', () => {
	it('parses a simple item description', () => {
		const item = parseWishlistItem('Cast iron skillet');
		expect(item.name).toBe('Cast iron skillet');
		expect(item.description).toBe('Cast iron skillet');
		expect(item.status).toBe('want');
	});

	it('assigns a generated id', () => {
		const item = parseWishlistItem('Vitamins');
		expect(item.id).toBeTruthy();
		expect(typeof item.id).toBe('string');
	});

	it('sets created_at timestamp', () => {
		const before = Date.now();
		const item = parseWishlistItem('Protein bars');
		const after = Date.now();
		expect(item.created_at).toBeGreaterThanOrEqual(before);
		expect(item.created_at).toBeLessThanOrEqual(after);
	});

	it('uses first sentence as name when description has multiple sentences', () => {
		const item = parseWishlistItem('Running shoes. For the gym. Size 10.');
		expect(item.name).toBe('Running shoes');
		expect(item.description).toBe('Running shoes. For the gym. Size 10.');
	});

	it('trims whitespace from description', () => {
		const item = parseWishlistItem('  Hot sauce  ');
		expect(item.name).toBe('Hot sauce');
		expect(item.description).toBe('Hot sauce');
	});

	it('truncates name to 60 chars when first sentence is very long', () => {
		const long = 'A'.repeat(80);
		const item = parseWishlistItem(long);
		expect(item.name.length).toBe(60);
	});

	it('throws when description is empty', () => {
		expect(() => parseWishlistItem('')).toThrow('Description cannot be empty');
		expect(() => parseWishlistItem('   ')).toThrow('Description cannot be empty');
	});
});

describe('WishlistItem type', () => {
	it('has the expected shape', () => {
		const item: WishlistItem = {
			id: 'abc123',
			name: 'Vitamins',
			description: 'Vitamins',
			status: 'want',
			created_at: Date.now()
		};
		expect(item.status).toBe('want');
	});
});
