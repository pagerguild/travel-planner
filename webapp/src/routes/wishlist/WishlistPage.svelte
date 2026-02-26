<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase, type DbWishlistItem } from '$lib/supabase.js';
	import { parseWishlistItem, type WishlistItem } from '$lib/wishlist.js';

	let description = $state('');
	let error = $state('');
	let items = $state<WishlistItem[]>([]);
	let editingId = $state<string | null>(null);
	let editingDescription = $state('');

	const STATUS_LABELS: Record<WishlistItem['status'], string> = {
		want: 'Want',
		purchased: 'Purchased',
		packed: 'Packed'
	};

	const STATUS_NEXT: Record<WishlistItem['status'], WishlistItem['status']> = {
		want: 'purchased',
		purchased: 'packed',
		packed: 'want'
	};

	const STATUS_CLASSES: Record<WishlistItem['status'], string> = {
		want: 'bg-blue-100 text-blue-800',
		purchased: 'bg-green-100 text-green-800',
		packed: 'bg-purple-100 text-purple-800'
	};

	function dbToItem(row: DbWishlistItem): WishlistItem {
		const item = parseWishlistItem(row.description);
		return {
			...item,
			id: row.id,
			status: row.status ?? 'want',
			created_at: new Date(row.created_at).getTime()
		};
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
		const { data, error: dbError } = await supabase
			.from('wishlist_items')
			.insert({ description: item.description, status: item.status })
			.select()
			.single();
		if (dbError) {
			error = 'Failed to save item. Please try again.';
			// Roll back optimistic update
			items = items.filter((i) => i.id !== item.id);
		} else if (data) {
			// Replace optimistic item with server-assigned id
			items = items.map((i) => (i.id === item.id ? dbToItem(data as DbWishlistItem) : i));
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') addItem();
	}

	async function deleteItem(id: string) {
		// Optimistic update
		const removed = items.find((i) => i.id === id);
		items = items.filter((i) => i.id !== id);
		const { error: dbError } = await supabase.from('wishlist_items').delete().eq('id', id);
		if (dbError) {
			error = 'Failed to delete item. Please try again.';
			// Roll back
			if (removed) items = [removed, ...items];
		}
	}

	async function cycleStatus(item: WishlistItem) {
		const nextStatus = STATUS_NEXT[item.status];
		// Optimistic update
		items = items.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i));
		const { error: dbError } = await supabase
			.from('wishlist_items')
			.update({ status: nextStatus })
			.eq('id', item.id);
		if (dbError) {
			error = 'Failed to update status. Please try again.';
			// Roll back
			items = items.map((i) => (i.id === item.id ? { ...i, status: item.status } : i));
		}
	}

	function startEdit(item: WishlistItem) {
		editingId = item.id;
		editingDescription = item.description;
	}

	function cancelEdit() {
		editingId = null;
		editingDescription = '';
	}

	async function saveEdit(item: WishlistItem) {
		const trimmed = editingDescription.trim();
		if (!trimmed) return;
		let updated: WishlistItem;
		try {
			updated = parseWishlistItem(trimmed);
		} catch {
			return;
		}
		// Preserve original id, status, created_at
		const newItem: WishlistItem = {
			...updated,
			id: item.id,
			status: item.status,
			created_at: item.created_at
		};
		// Optimistic update
		items = items.map((i) => (i.id === item.id ? newItem : i));
		editingId = null;
		editingDescription = '';
		const { error: dbError } = await supabase
			.from('wishlist_items')
			.update({ description: trimmed })
			.eq('id', item.id);
		if (dbError) {
			error = 'Failed to update item. Please try again.';
			// Roll back
			items = items.map((i) => (i.id === item.id ? item : i));
		}
	}

	function handleEditKeydown(e: KeyboardEvent, item: WishlistItem) {
		if (e.key === 'Enter') saveEdit(item);
		if (e.key === 'Escape') cancelEdit();
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
					{#if editingId === item.id}
						<!-- Edit mode -->
						<div class="flex gap-2">
							<input
								type="text"
								bind:value={editingDescription}
								onkeydown={(e) => handleEditKeydown(e, item)}
								class="flex-1 rounded border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
							/>
							<button
								onclick={() => saveEdit(item)}
								class="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
								aria-label="Save edit"
							>
								Save
							</button>
							<button
								onclick={cancelEdit}
								class="rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300"
								aria-label="Cancel edit"
							>
								Cancel
							</button>
						</div>
					{:else}
						<!-- View mode -->
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0 flex-1">
								<p class="font-medium text-gray-900">{item.name}</p>
								{#if item.description !== item.name}
									<p class="mt-1 text-sm text-gray-500">{item.description}</p>
								{/if}
							</div>
							<div class="flex shrink-0 items-center gap-2">
								<!-- Status badge / cycle button -->
								<button
									onclick={() => cycleStatus(item)}
									class="rounded-full px-2.5 py-0.5 text-xs font-medium {STATUS_CLASSES[
										item.status
									]} cursor-pointer hover:opacity-80"
									title="Click to change status"
									aria-label="Status: {STATUS_LABELS[item.status]}. Click to advance."
								>
									{STATUS_LABELS[item.status]}
								</button>
								<!-- Edit button -->
								<button
									onclick={() => startEdit(item)}
									class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
									aria-label="Edit {item.name}"
									title="Edit"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
										/>
									</svg>
								</button>
								<!-- Delete button -->
								<button
									onclick={() => deleteItem(item.id)}
									class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
									aria-label="Delete {item.name}"
									title="Delete"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
											clip-rule="evenodd"
										/>
									</svg>
								</button>
							</div>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</main>
