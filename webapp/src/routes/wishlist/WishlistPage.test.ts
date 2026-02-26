import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import WishlistPage from './WishlistPage.svelte';

// Mock the supabase module so tests don't need real credentials
const insertedRows: unknown[] = [];
const mockSingle = { data: null, error: null };
const mockSelectResult = { data: insertedRows, error: null };
const mockMutationResult = { data: null, error: null };

const mockChain = {
	select: (_cols?: unknown) => ({
		...mockChain,
		order: () => Promise.resolve(mockSelectResult),
		single: () => Promise.resolve(mockSingle)
	}),
	order: () => Promise.resolve(mockSelectResult),
	insert: (_row: unknown) => ({
		select: () => ({
			single: () => Promise.resolve(mockSingle)
		})
	}),
	update: (_row: unknown) => ({
		eq: () => Promise.resolve(mockMutationResult)
	}),
	delete: () => ({
		eq: () => Promise.resolve(mockMutationResult)
	})
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

	it('shows a delete button for each item', async () => {
		render(WishlistPage);
		const input = screen.getByPlaceholderText(/describe what you want/i);
		await fireEvent.input(input, { target: { value: 'Cast iron skillet' } });
		await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		expect(screen.getByRole('button', { name: /delete cast iron skillet/i })).toBeInTheDocument();
	});

	it('removes an item when the delete button is clicked', async () => {
		render(WishlistPage);
		const input = screen.getByPlaceholderText(/describe what you want/i);
		await fireEvent.input(input, { target: { value: 'Cast iron skillet' } });
		await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		expect(screen.getByText('Cast iron skillet')).toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: /delete cast iron skillet/i }));
		expect(screen.queryByText('Cast iron skillet')).not.toBeInTheDocument();
	});

	it('shows a status badge for each item', async () => {
		render(WishlistPage);
		const input = screen.getByPlaceholderText(/describe what you want/i);
		await fireEvent.input(input, { target: { value: 'Vitamins' } });
		await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		// Status badge shows "Want" initially
		expect(screen.getByRole('button', { name: /status: want/i })).toBeInTheDocument();
	});

	it('cycles status from want to purchased when status badge is clicked', async () => {
		render(WishlistPage);
		const input = screen.getByPlaceholderText(/describe what you want/i);
		await fireEvent.input(input, { target: { value: 'Vitamins' } });
		await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		const statusBtn = screen.getByRole('button', { name: /status: want/i });
		await fireEvent.click(statusBtn);
		expect(screen.getByRole('button', { name: /status: purchased/i })).toBeInTheDocument();
	});

	it('shows an edit button for each item', async () => {
		render(WishlistPage);
		const input = screen.getByPlaceholderText(/describe what you want/i);
		await fireEvent.input(input, { target: { value: 'Hot sauce' } });
		await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		expect(screen.getByRole('button', { name: /edit hot sauce/i })).toBeInTheDocument();
	});

	it('enters edit mode when edit button is clicked', async () => {
		render(WishlistPage);
		const input = screen.getByPlaceholderText(/describe what you want/i);
		await fireEvent.input(input, { target: { value: 'Hot sauce' } });
		await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		await fireEvent.click(screen.getByRole('button', { name: /edit hot sauce/i }));
		expect(screen.getByRole('button', { name: /save edit/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /cancel edit/i })).toBeInTheDocument();
	});

	it('saves edited description', async () => {
		render(WishlistPage);
		const input = screen.getByPlaceholderText(/describe what you want/i);
		await fireEvent.input(input, { target: { value: 'Hot sauce' } });
		await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		await fireEvent.click(screen.getByRole('button', { name: /edit hot sauce/i }));
		// Find the edit input (not the main add input)
		const editInputs = screen.getAllByRole('textbox');
		const editInput = editInputs.find(
			(el) => (el as HTMLInputElement).value === 'Hot sauce'
		) as HTMLInputElement;
		await fireEvent.input(editInput, { target: { value: 'Sriracha hot sauce' } });
		await fireEvent.click(screen.getByRole('button', { name: /save edit/i }));
		expect(screen.getByText('Sriracha hot sauce')).toBeInTheDocument();
	});

	it('cancels edit when cancel button is clicked', async () => {
		render(WishlistPage);
		const input = screen.getByPlaceholderText(/describe what you want/i);
		await fireEvent.input(input, { target: { value: 'Hot sauce' } });
		await fireEvent.click(screen.getByRole('button', { name: /add/i }));
		await fireEvent.click(screen.getByRole('button', { name: /edit hot sauce/i }));
		await fireEvent.click(screen.getByRole('button', { name: /cancel edit/i }));
		// Back to view mode
		expect(screen.getByText('Hot sauce')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /save edit/i })).not.toBeInTheDocument();
	});
});
