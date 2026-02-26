import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import WishlistPage from './WishlistPage.svelte';

// Mock the supabase module so tests don't need real credentials
const mockResult = { data: [], error: null };
const mockChain = {
	select: () => mockChain,
	order: () => Promise.resolve(mockResult),
	insert: (_row: unknown) => ({ select: () => Promise.resolve(mockResult) }),
};
vi.mock('$lib/supabase', () => ({
	supabase: {
		from: () => mockChain
	}
}));

describe('WishlistPage', () => {
	it('renders a text input for natural language description', () => {
		render(WishlistPage);
		const input = screen.getByPlaceholderText(/describe what you want/i);
		expect(input).toBeInTheDocument();
	});

	it('renders an add button', () => {
		render(WishlistPage);
		expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
	});

	it('shows an empty state message when no items exist', () => {
		render(WishlistPage);
		expect(screen.getByText(/your wishlist is empty/i)).toBeInTheDocument();
	});

	it('adds an item when the form is submitted', async () => {
		render(WishlistPage);
		const input = screen.getByPlaceholderText(/describe what you want/i);
		await fireEvent.input(input, { target: { value: 'Cast iron skillet' } });
		await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		expect(screen.getByText('Cast iron skillet')).toBeInTheDocument();
	});

	it('clears the input after adding an item', async () => {
		render(WishlistPage);
		const input = screen.getByPlaceholderText(/describe what you want/i) as HTMLInputElement;
		await fireEvent.input(input, { target: { value: 'Hot sauce' } });
		await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		expect(input.value).toBe('');
	});

	it('does not add an item when description is empty', async () => {
		render(WishlistPage);
		await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		expect(screen.getByText(/your wishlist is empty/i)).toBeInTheDocument();
	});

	it('shows a validation error when submitting empty input', async () => {
		render(WishlistPage);
		await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		expect(screen.getByText(/please enter a description/i)).toBeInTheDocument();
	});

	it('shows each added item in a list', async () => {
		render(WishlistPage);
		const input = screen.getByPlaceholderText(/describe what you want/i);
		for (const desc of ['Vitamins', 'Protein bars', 'Running shoes']) {
			await fireEvent.input(input, { target: { value: desc } });
			await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		}
		expect(screen.getByText('Vitamins')).toBeInTheDocument();
		expect(screen.getByText('Protein bars')).toBeInTheDocument();
		expect(screen.getByText('Running shoes')).toBeInTheDocument();
	});
});
