<script lang="ts">
    import { timer } from "$lib/stores/timers";
    import { type TimerEntry } from "$lib/types/timer.types";
    import { formatTime } from "$lib/utils";

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
                    <div class="list-col-grow">
                        <div>{formatTime(entry.total!)}</div>
                    </div>
                </li>
            {/each}
        </ul>
    </div>
{/if}
