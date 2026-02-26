<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase, type DbWishlistItem } from '$lib/supabase.js';
	import { parseWishlistItem, type WishlistItem } from '$lib/wishlist.js';

	let description = $state('');
	let error = $state('');
	let items = $state<WishlistItem[]>([]);

	function dbToItem(row: DbWishlistItem): WishlistItem {
		return parseWishlistItem(row.description);
	}

	onMount(async () => {
		const { data } = await supabase
			.from('wishlist_items')
			.select('*')
			.order('created_at', { ascending: false });
		if (data) {
			items = (data as DbWishlistItem[]).map(dbToItem);
		}
	});

	async function addItem() {
		error = '';
		if (!description.trim()) {
			error = 'Please enter a description';
			return;
		}
		const item = parseWishlistItem(description);
		// Optimistic update
		items = [item, ...items];
		description = '';
		// Persist to Supabase
		const { error: dbError } = await supabase
			.from('wishlist_items')
			.insert({ description: item.description });
		if (dbError) {
			error = 'Failed to save item. Please try again.';
			// Roll back optimistic update
			items = items.filter((i) => i.id !== item.id);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') addItem();
	}
</script>

<main class="mx-auto max-w-2xl px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold">Wishlist</h1>

	<div class="mb-6 flex gap-2">
		<input
			type="text"
			bind:value={description}
			onkeydown={handleKeydown}
			placeholder="Describe what you want..."
			class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none"
		/>
		<button
			onclick={addItem}
			class="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none"
		>
			Add
		</button>
	</div>

	{#if error}
		<p class="mb-4 text-sm text-red-600">{error}</p>
	{/if}

	{#if items.length === 0}
		<p class="text-gray-500">Your wishlist is empty. Add something above!</p>
	{:else}
		<ul class="space-y-3">
			{#each items as item (item.id)}
				<li class="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
					<p class="font-medium text-gray-900">{item.name}</p>
					{#if item.description !== item.name}
						<p class="mt-1 text-sm text-gray-500">{item.description}</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</main>
