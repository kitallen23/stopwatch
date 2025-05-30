<script lang="ts">
    import { timer } from "$lib/stores/timers";
    import { rerenderKey } from "$lib/stores/rerenderTimer";
    import { type TimerEntry } from "$lib/types/timer.types";
    import { formatTime, formatTimeStampRelativeToNow } from "$lib/utils";

    let allTimerEntries = $derived<TimerEntry[]>(
        $timer?.entries ? [...$timer.entries].reverse() : []
    );
</script>

{#if allTimerEntries.length}
    <div class="mx-auto grid max-w-sm min-w-64 gap-4 p-6">
        <div>history ({allTimerEntries.length})</div>
        <ul class="list bg-base-200 rounded-box shadow-md">
            {#each allTimerEntries as entry (entry.id)}
                <li class="list-row">
                    <div class="item-timer-display list-col-grow">
                        <div>{formatTime(entry.total!)}</div>
                    </div>
                    {#if entry.createdAt}
                        {#key $rerenderKey}
                            <div class="text-primary/50">
                                <div>{formatTimeStampRelativeToNow(entry.createdAt)}</div>
                            </div>
                        {/key}
                    {/if}
                </li>
            {/each}
        </ul>
    </div>
{/if}

<style>
    .item-timer-display {
        min-width: 5em;
    }
</style>
