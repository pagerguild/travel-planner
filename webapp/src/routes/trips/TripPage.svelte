<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase, type DbWishlistItem } from '$lib/supabase.js';
	import { type WishlistItem, type ItemStatus, formatPrice } from '$lib/wishlist.js';

	let items = $state<WishlistItem[]>([]);
	let error = $state('');

	// Per-item editing state
	let editingId = $state<string | null>(null);
	let editPrice = $state('');
	let editWeight = $state('');

	function dbToItem(row: DbWishlistItem): WishlistItem {
		const firstSentence = row.description.split(/[.\n]/)[0].trim();
		const name = firstSentence.length > 60 ? firstSentence.slice(0, 60) : firstSentence;
		return {
			id: row.id,
			description: row.description,
			name,
			status: row.status ?? 'want',
			actual_price: row.actual_price ?? undefined,
			weight_g: row.weight_g ?? undefined,
			created_at: new Date(row.created_at).getTime()
		};
	}

	onMount(async () => {
		const { data, error: dbError } = await supabase
			.from('wishlist_items')
			.select('*')
			.order('created_at', { ascending: false });
		if (dbError) {
			error = 'Failed to load items.';
		} else if (data) {
			items = (data as DbWishlistItem[]).map(dbToItem);
		}
	});

	/** Start editing a specific item */
	function startEdit(item: WishlistItem) {
		editingId = item.id;
		editPrice = item.actual_price != null ? (item.actual_price / 100).toFixed(2) : '';
		editWeight = item.weight_g != null ? String(item.weight_g) : '';
	}

	function cancelEdit() {
		editingId = null;
		editPrice = '';
		editWeight = '';
	}

	/** Mark an item as purchased (or toggle back to want) */
	async function markPurchased(item: WishlistItem) {
		const newStatus: ItemStatus = item.status === 'purchased' ? 'want' : 'purchased';
		// Optimistic update
		items = items.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i));

		const { error: dbError } = await supabase
			.from('wishlist_items')
			.update({ status: newStatus })
			.eq('id', item.id);

		if (dbError) {
			error = 'Failed to update status.';
			// Roll back
			items = items.map((i) => (i.id === item.id ? { ...i, status: item.status } : i));
		}
	}

	/** Save actual price and optional weight for a purchased item */
	async function savePurchaseDetails(item: WishlistItem) {
		error = '';
		const priceDollars = parseFloat(editPrice);
		if (editPrice.trim() !== '' && (isNaN(priceDollars) || priceDollars < 0)) {
			error = 'Please enter a valid price (e.g. 19.99)';
			return;
		}
		const weightGrams = editWeight.trim() !== '' ? parseInt(editWeight, 10) : undefined;
		if (editWeight.trim() !== '' && (isNaN(weightGrams!) || weightGrams! < 0)) {
			error = 'Please enter a valid weight in grams';
			return;
		}

		const actual_price = editPrice.trim() !== '' ? Math.round(priceDollars * 100) : null;
		const weight_g = weightGrams ?? null;

		// Optimistic update
		items = items.map((i) =>
			i.id === item.id
				? {
						...i,
						status: 'purchased' as ItemStatus,
						actual_price: actual_price ?? undefined,
						weight_g: weight_g ?? undefined
					}
				: i
		);
		editingId = null;

		const { error: dbError } = await supabase
			.from('wishlist_items')
			.update({ status: 'purchased', actual_price, weight_g })
			.eq('id', item.id);

		if (dbError) {
			error = 'Failed to save purchase details.';
			// Roll back
			items = items.map((i) =>
				i.id === item.id
					? { ...i, status: item.status, actual_price: item.actual_price, weight_g: item.weight_g }
					: i
			);
		}
	}

	// Derived counts
	let purchasedCount = $derived(items.filter((i) => i.status === 'purchased' || i.status === 'packed').length);
	let remainingCount = $derived(items.filter((i) => i.status === 'want').length);
	let totalSpent = $derived(
		items
			.filter((i) => i.status === 'purchased' || i.status === 'packed')
			.reduce((sum, i) => sum + (i.actual_price ?? 0), 0)
	);
</script>

<main class="mx-auto max-w-2xl px-4 py-8">
	<div class="mb-2 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Trip Items</h1>
		<a href="/wishlist" class="text-sm text-blue-600 underline hover:text-blue-800">← Wishlist</a>
	</div>

	<!-- Summary bar -->
	{#if items.length > 0}
		<div class="mb-6 flex gap-4 rounded-lg bg-gray-50 px-4 py-3 text-sm">
			<span class="font-medium text-green-700">✓ Purchased: {purchasedCount}</span>
			<span class="font-medium text-gray-600">○ Remaining: {remainingCount}</span>
			{#if totalSpent > 0}
				<span class="ml-auto font-medium text-gray-800">Total: {formatPrice(totalSpent)}</span>
			{/if}
		</div>
	{/if}

	{#if error}
		<p class="mb-4 text-sm text-red-600">{error}</p>
	{/if}

	{#if items.length === 0}
		<p class="text-gray-500">
			No items yet. <a href="/wishlist" class="text-blue-600 underline hover:text-blue-800"
				>Add items to your wishlist</a
			> first.
		</p>
	{:else}
		<ul class="space-y-3">
			{#each items as item (item.id)}
				<li
					class="rounded-lg border px-4 py-3 shadow-sm transition-colors {item.status === 'purchased' || item.status === 'packed'
						? 'border-green-300 bg-green-50'
						: 'border-gray-200 bg-white'}"
				>
					<div class="flex items-start gap-3">
						<!-- Checkbox -->
						<button
							onclick={() => markPurchased(item)}
							aria-label={item.status === 'purchased' ? 'Mark as not purchased' : 'Mark as purchased'}
							class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors {item.status === 'purchased' || item.status === 'packed'
								? 'border-green-500 bg-green-500 text-white'
								: 'border-gray-400 bg-white hover:border-green-400'}"
						>
							{#if item.status === 'purchased' || item.status === 'packed'}
								<svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
									<polyline points="2,6 5,9 10,3" />
								</svg>
							{/if}
						</button>

						<!-- Item details -->
						<div class="min-w-0 flex-1">
							<p
								class="font-medium {item.status === 'purchased' || item.status === 'packed'
									? 'text-green-800 line-through decoration-green-400'
									: 'text-gray-900'}"
							>
								{item.name}
							</p>
							{#if item.description !== item.name}
								<p class="mt-0.5 text-sm text-gray-500">{item.description}</p>
							{/if}

							<!-- Purchase details (price / weight) when purchased -->
							{#if (item.status === 'purchased' || item.status === 'packed') && editingId !== item.id}
								<div class="mt-1 flex flex-wrap gap-3 text-sm">
									{#if item.actual_price != null}
										<span class="text-green-700">💵 {formatPrice(item.actual_price)}</span>
									{/if}
									{#if item.weight_g != null}
										<span class="text-gray-600">⚖ {item.weight_g} g</span>
									{/if}
									<button
										onclick={() => startEdit(item)}
										class="text-blue-600 underline hover:text-blue-800"
									>
										{item.actual_price != null ? 'Edit details' : 'Add price/weight'}
									</button>
								</div>
							{/if}

							<!-- Edit form for purchase details -->
							{#if editingId === item.id}
								<div class="mt-2 flex flex-wrap items-end gap-2">
									<label class="flex flex-col gap-1 text-xs text-gray-600">
										Price ($)
										<input
											type="number"
											min="0"
											step="0.01"
											placeholder="e.g. 19.99"
											bind:value={editPrice}
											class="w-28 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
										/>
									</label>
									<label class="flex flex-col gap-1 text-xs text-gray-600">
										Weight (g)
										<input
											type="number"
											min="0"
											step="1"
											placeholder="e.g. 450"
											bind:value={editWeight}
											class="w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
										/>
									</label>
									<button
										onclick={() => savePurchaseDetails(item)}
										class="rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700"
									>
										Save
									</button>
									<button
										onclick={cancelEdit}
										class="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
									>
										Cancel
									</button>
								</div>
							{/if}

							<!-- "Add price/weight" prompt for newly marked purchased items with no price -->
							{#if (item.status === 'purchased' || item.status === 'packed') && editingId !== item.id && item.actual_price == null}
								<!-- already shown above via the "Add price/weight" link -->
							{/if}
						</div>

						<!-- Status badge -->
						<span
							class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium {item.status === 'purchased'
								? 'bg-green-100 text-green-800'
								: item.status === 'packed'
									? 'bg-blue-100 text-blue-800'
									: 'bg-gray-100 text-gray-600'}"
						>
							{item.status}
						</span>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</main>
