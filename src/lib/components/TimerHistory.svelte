<script lang="ts">
    import { removeTimerEntry, timer, updateTimerEntry } from "$lib/stores/timers";
    import { rerenderKey } from "$lib/stores/rerenderTimer";
    import { type TimerEntry } from "$lib/types/timer.types";
    import { formatTime, formatTimeStampRelativeToNow } from "$lib/utils";
    import CommentText from "virtual:icons/mdi/comment-text-outline";
    import CommentEdit from "virtual:icons/mdi/comment-edit-outline";
    import Delete from "virtual:icons/material-symbols/delete-outline";

    let allTimerEntries = $derived<TimerEntry[]>(
        $timer?.entries ? [...$timer.entries].reverse() : []
    );

    let editModal: HTMLDialogElement | undefined;

    let tempNotesValue = $state<string>("");
    let editTimerEntryId = $state<string | null>(null);
    $effect(() => {
        if (editModal && editTimerEntryId) {
            let timerEntry = $timer?.entries.find((entry) => entry.id === editTimerEntryId);
            editModal.showModal();
            if (timerEntry?.notes) {
                tempNotesValue = timerEntry.notes;
            }
        } else {
            editModal?.close();
            tempNotesValue = "";
        }
    });

    function onNotesSubmit() {
        if (editTimerEntryId) {
            updateTimerEntry(editTimerEntryId, { notes: tempNotesValue || "" });
        }
        editModal?.close();
        tempNotesValue = "";
    }
</script>

{#if allTimerEntries.length}
    <div class="mx-auto grid max-w-md min-w-64 gap-4 p-6">
        <div>history <span class="text-base-content/50">({allTimerEntries.length})</span></div>
        <ul class="list bg-base-200 rounded-box shadow-md">
            {#each allTimerEntries as entry (entry.id)}
                <li class="list-row items-center p-3">
                    <div class="item-timer-display list-col-grow">
                        <div>{formatTime(entry.total!)}</div>
                    </div>
                    {#if entry.createdAt}
                        {#key $rerenderKey}
                            <div class="text-primary/50 text-xs">
                                <div>{formatTimeStampRelativeToNow(entry.createdAt)}</div>
                            </div>
                        {/key}
                    {/if}
                    <div class="flex">
                        <div class="sm:tooltip">
                            <div
                                class="tooltip-content hidden max-w-56 text-start whitespace-pre-line sm:block"
                            >
                                {entry.notes.trim()}
                            </div>
                            <button
                                class={`notes-button btn btn-ghost btn-sm ${entry.notes.trim() ? "" : "invisible"} text-primary/50 hover:text-primary -my-2 h-auto px-2 py-2`}
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
                                class="btn btn-ghost btn-sm text-primary/50 hover:text-error -my-2 h-auto px-2 py-2"
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
    </div>
    {#key editTimerEntryId}
        <dialog
            id="edit_modal"
            class="modal"
            onclose={() => (editTimerEntryId = null)}
            bind:this={editModal}
        >
            <div
                class="modal-box h-[calc(60dvh-var(--spacing)*8)] min-h-[80dvh] sm:h-auto sm:min-h-auto"
            >
                <div class="grid h-full grid-cols-1 grid-rows-[1fr_auto] gap-y-4">
                    <textarea
                        class="textarea textarea-primary col-span-2 h-auto w-full sm:h-40 sm:min-h-40"
                        placeholder="notes"
                        bind:value={tempNotesValue}
                    ></textarea>
                    <div class="flex w-full justify-between">
                        <button class="btn btn-ghost" onclick={() => (editTimerEntryId = null)}
                            >cancel</button
                        >
                        <button class="btn btn-primary" onclick={onNotesSubmit}>submit</button>
                    </div>
                </div>
            </div>
        </dialog>
    {/key}
{/if}

<style>
    .item-timer-display {
        min-width: 5em;
    }
    .list-row:hover {
        .notes-button {
            visibility: visible;
        }
    }
    .tooltip-content {
        transform: translateX(-75%) translateY(var(--tt-pos, 0.25rem));
    }
</style>
