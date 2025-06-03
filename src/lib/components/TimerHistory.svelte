<script lang="ts">
    import {
        clearTimerEntries,
        removeTimerEntry,
        timer,
        updateTimerEntry,
    } from "$lib/stores/timers";
    import { rerenderKey } from "$lib/stores/rerenderTimer";
    import { type TimerEntry } from "$lib/types/timer.types";
    import { formatTime, formatTimeStampRelativeToNow } from "$lib/utils";
    import CommentText from "virtual:icons/mdi/comment-text-outline";
    import CommentEdit from "virtual:icons/mdi/comment-edit-outline";
    import WindowClose from "virtual:icons/mdi/window-close";
    import Delete from "virtual:icons/material-symbols/delete-outline";

    const PAGE_SIZE = 100;
    const INITIAL_PAGE_SIZE = 5;

    let pages = $state(0);
    let paginatedTimerEntries = $derived<TimerEntry[]>(
        [...($timer?.entries || [])].reverse().slice(0, INITIAL_PAGE_SIZE + pages * PAGE_SIZE)
    );

    let editModalElement: HTMLDialogElement | undefined = $state(undefined);

    let tempNotesValue = $state<string>("");
    let editTimerEntryId = $state<string | null>(null);
    $effect(() => {
        if (editModalElement && editTimerEntryId) {
            let timerEntry = $timer?.entries.find((entry) => entry.id === editTimerEntryId);
            editModalElement.showModal();
            if (timerEntry?.notes) {
                tempNotesValue = timerEntry.notes;
            }
        } else {
            editModalElement?.close();
            tempNotesValue = "";
        }
    });

    function onNotesSubmit() {
        if (editTimerEntryId) {
            updateTimerEntry(editTimerEntryId, { notes: tempNotesValue || "" });
        }
        editModalElement?.close();
        tempNotesValue = "";
    }

    let isClearModalOpen = $state(false);
    let confirmClearModalElement: HTMLDialogElement | undefined = $state(undefined);
    $effect(() =>
        isClearModalOpen ? confirmClearModalElement?.showModal() : confirmClearModalElement?.close()
    );

    function onClearTimerHistory() {
        clearTimerEntries();
        isClearModalOpen = false;
    }
</script>

{#if paginatedTimerEntries.length}
    <div class="mx-auto grid w-full max-w-md min-w-64 gap-4 px-6">
        <div class="flex items-center justify-between">
            <div>
                history <span class="text-base-content/60">({($timer?.entries || []).length})</span>
            </div>
            <button
                class="btn btn-ghost btn-sm text-base-content/60"
                onclick={() => (isClearModalOpen = true)}
                aria-label="Clear timer history"
            >
                clear
            </button>
        </div>
        <ul class="list bg-base-200 rounded-box shadow-md">
            {#each paginatedTimerEntries as entry (entry.id)}
                <li class="list-row items-center p-3">
                    <div class="item-timer-display list-col-grow">
                        <div>{formatTime(entry.total!)}</div>
                    </div>
                    {#if entry.createdAt}
                        {#key $rerenderKey}
                            <div class="text-primary/60 text-xs">
                                <div>{formatTimeStampRelativeToNow(entry.createdAt)}</div>
                            </div>
                        {/key}
                    {/if}
                    <div class="flex">
                        <div class="sm:tooltip">
                            <div class="tooltip-content hidden max-w-56 min-w-24 sm:block">
                                {#if entry.notes.trim()}
                                    <div class="text-start whitespace-pre-line">
                                        {entry.notes.trim()}
                                    </div>
                                {/if}
                            </div>
                            <button
                                class={`notes-button btn btn-ghost btn-sm ${entry.notes.trim() ? "" : "visible sm:invisible"} text-primary/60 hover:text-primary -my-2 h-auto px-2 py-2`}
                                aria-label="Show notes"
                                onclick={() => (editTimerEntryId = entry.id)}
                            >
                                {#if entry.notes.trim()}
                                    <CommentText />
                                {:else}
                                    <CommentEdit />
                                {/if}
                            </button>
                        </div>
                        <div>
                            <button
                                class="delete-button btn btn-ghost btn-sm text-primary/60 hover:text-error visible -my-2 h-auto px-2 py-2 sm:invisible"
                                aria-label="Remove timer entry"
                                onclick={() => removeTimerEntry(entry.id)}
                            >
                                <Delete />
                            </button>
                        </div>
                    </div>
                </li>
            {/each}
        </ul>
        {#if paginatedTimerEntries.length < ($timer?.entries || []).length}
            <div class="text-center">
                <button class="btn btn-ghost btn-sm text-base-content/60" onclick={() => pages++}>
                    load more
                </button>
            </div>
        {/if}
    </div>
    <dialog
        id="edit_modal"
        class="modal"
        onclose={() => (editTimerEntryId = null)}
        onclick={(e) => e.target === editModalElement && (editTimerEntryId = null)}
        bind:this={editModalElement}
    >
        <div
            class="modal-box h-[calc(60dvh-var(--spacing)*8)] min-h-[80dvh] sm:h-auto sm:min-h-auto"
        >
            <div class="grid h-full grid-cols-1 grid-rows-[1fr_auto] gap-y-4">
                <textarea
                    class="textarea textarea-primary col-span-2 h-auto w-full resize-none sm:h-40 sm:min-h-40 sm:resize-y"
                    placeholder="notes"
                    bind:value={tempNotesValue}
                ></textarea>
                <div class="flex w-full justify-between">
                    <button class="btn btn-ghost" onclick={() => (editTimerEntryId = null)}>
                        cancel
                    </button>
                    <button class="btn btn-primary" onclick={onNotesSubmit}>submit</button>
                </div>
            </div>
        </div>
    </dialog>

    <dialog
        id="clear_modal"
        class="modal"
        onclose={() => (isClearModalOpen = false)}
        onclick={(e) => e.target === confirmClearModalElement && (isClearModalOpen = false)}
        bind:this={confirmClearModalElement}
    >
        <div class="modal-box max-w-sm">
            <button
                class="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content absolute top-2 right-2"
                aria-label="Cancel & close modal"
                onclick={() => (isClearModalOpen = false)}
            >
                <WindowClose />
            </button>
            <div class="grid gap-y-4">
                <h3 class="text-lg font-bold">clear timer history</h3>
                <p class="py-4">are you sure you wish to clear all history items for this timer?</p>
                <div class="flex w-full justify-between">
                    <button class="btn btn-ghost" onclick={() => (isClearModalOpen = false)}>
                        cancel
                    </button>
                    <button class="btn btn-primary" onclick={onClearTimerHistory}>yes</button>
                </div>
            </div>
        </div>
    </dialog>
{/if}

<style>
    .item-timer-display {
        min-width: 5em;
    }
    .list-row:hover {
        .notes-button {
            visibility: visible;
        }
        .delete-button {
            visibility: visible;
        }
    }
    .tooltip-content {
        transform: translateX(-75%) translateY(var(--tt-pos, 0.25rem));
    }
</style>
