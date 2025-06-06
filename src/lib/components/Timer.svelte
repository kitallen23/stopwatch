<script lang="ts">
    import { onMount } from "svelte";
    import { nanoid } from "nanoid";

    import PlayArrow from "virtual:icons/material-symbols/play-arrow";
    import Pause from "virtual:icons/material-symbols/pause";
    import Refresh from "virtual:icons/material-symbols/refresh";
    import Delete from "virtual:icons/material-symbols/delete-outline";

    import type { TimerEntry } from "$lib/types/timer.types";
    import { zenMode } from "$lib/stores/zenMode";
    import { addTimerEntry } from "$lib/stores/timers";
    import { formatTime } from "$lib/utils";
    import { trackEvent } from "$lib/stores/analytics";

    let activeStartTime: number | null = $state(null); // Timestamp (ms) when the current active segment started
    let currentTimeDisplay: string = $state("0.00"); // Formatted time for display

    // Stores the animation frame ID - note that this must not use $state, as we don't want svelte
    // to update based on this value changing
    let animationFrameId: number | null = null;
    let lastUpdateTime: number = 0; // Timestamp of the last display update

    const BLANK_TIMER_ENTRY = {
        id: "",
        notes: "",
        times: [],
        createdAt: null,
    };

    function blankTimerEntry() {
        return { ...BLANK_TIMER_ENTRY, id: nanoid(8) };
    }

    let timerEntry: TimerEntry = $state(blankTimerEntry());
    let isTimerActive: boolean = $state(false);
    let animationKey: number = $state(0);

    /**
     * Calculates the total elapsed time in milliseconds.
     * @returns {number} Total elapsed time in milliseconds.
     */
    function calculateTotalElapsedTimeMs(): number {
        let totalMs = 0;
        // Sum duration of all completed segments
        for (const segment of timerEntry.times) {
            totalMs += segment[1] - segment[0];
        }
        // If timer is currently active, add time from current segment
        if (activeStartTime) {
            totalMs += Date.now() - activeStartTime;
        }
        return totalMs;
    }

    /**
     * The main loop for updating the timer display using requestAnimationFrame.
     * This function is called by the browser just before the next screen repaint
     * when the timer is active.
     */
    function runTimerLoop() {
        const now = Date.now();

        // Check if 10ms has passed since our last update
        if (now - lastUpdateTime >= 10) {
            // Recalculate the total elapsed time and format it for display.
            // This ensures the displayed time is always up-to-date for the current frame.
            currentTimeDisplay = formatTime(calculateTotalElapsedTimeMs());
            lastUpdateTime = now; // Set the last update time
        }

        // Check if the timer is still supposed to be active.
        // This acts as a condition to continue the animation loop.
        if (isTimerActive) {
            // If the timer is active, request that the browser calls `runTimerLoop` again before
            // the next screen repaint.
            // This creates a recursive loop that synchronizes with the browser's refresh rate,
            // leading to smooth updates.
            // The returned ID is stored in `animationFrameId` so that this specific pending request
            // can be cancelled if the timer is stopped or reset.
            animationFrameId = requestAnimationFrame(runTimerLoop);
        }
        // If `isTimerActive` is false (e.g., the timer was stopped), `requestAnimationFrame` is not
        // called, and the loop naturally terminates.
    }

    function handleTimerToggle() {
        isTimerActive = !isTimerActive;

        if (isTimerActive) {
            // Starting the timer
            activeStartTime = Date.now();
            if (!timerEntry.createdAt) {
                // Set createdAt on first start of an entry
                timerEntry.createdAt = activeStartTime;
            }
            // Start the animation frame loop
            runTimerLoop();
        } else {
            // Stopping the timer
            if (activeStartTime) {
                timerEntry.times.push([activeStartTime, Date.now()]);
                activeStartTime = null;
            }

            // Cancel the animation frame loop if active
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            // Update display one last time to show the exact stop time
            currentTimeDisplay = formatTime(calculateTotalElapsedTimeMs());
        }
    }
    const handleReset = () => handleTimerReset(true);
    const handleClear = () => handleTimerReset(false);

    /**
     * Resets the timer animation to its starting position, pauses it, and adds it to history.
     */
    function handleTimerReset(addToHistory: boolean = false) {
        if (isTimerActive) {
            // If timer is active, stop it first to save the current segment
            if (activeStartTime) {
                timerEntry.times.push([activeStartTime, Date.now()]);
            }
        }

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        if (timerEntry && timerEntry.times.length > 0) {
            // Create a plain object copy of timerEntry
            const plainTimerEntry = JSON.parse(JSON.stringify(timerEntry));

            const totalTime = calculateTotalElapsedTimeMs();

            if (addToHistory) {
                addTimerEntry({ ...plainTimerEntry, total: totalTime });
                trackEvent("timer_entry__add");
            } else {
                trackEvent("timer_entry__clear");
            }
        }

        timerEntry = blankTimerEntry();
        isTimerActive = false;
        activeStartTime = null;
        currentTimeDisplay = formatTime(0);
        lastUpdateTime = 0;
        animationKey++;
    }
    // Internal state for visuals
    const indicatorSize = "1.25rem";
    const lineWidthFactor = "3";
    const rotationSpeed = "4s";
    let containerCenterY = $state("0px");

    let timerContainerElement: HTMLDivElement;

    onMount(() => {
        if (timerContainerElement) {
            const updateIndicatorTransformOrigin = () => {
                const containerHeight = timerContainerElement.offsetHeight;
                containerCenterY = `${containerHeight / 2}px`;
            };

            updateIndicatorTransformOrigin();
            const resizeObserver = new ResizeObserver(updateIndicatorTransformOrigin);
            resizeObserver.observe(timerContainerElement);

            return () => {
                resizeObserver.disconnect();
            };
        }
    });

    let showDeleteButton = $derived(!isTimerActive && currentTimeDisplay !== "0.00");
</script>

<div class="mx-auto grid w-full max-w-sm min-w-64 gap-4 px-6">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="timer-container-child aspect-square"
        style="--indicator-size: {indicatorSize}; --rotation-speed: {rotationSpeed};
        --container-center-y: {containerCenterY}; --line-width-factor: {lineWidthFactor}"
        bind:this={timerContainerElement}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="timer-circle cursor-pointer" onclick={handleTimerToggle}></div>
        {#if $zenMode && isTimerActive}
            <span class="timer-time loading loading-ring text-primary"></span>
        {:else}
            <div
                class={`timer-time pointer-events-none sm:text-5xl ${currentTimeDisplay.length >= 8 ? "text-4xl" : "text-5xl"}`}
            >
                {currentTimeDisplay}
            </div>
        {/if}
        {#key animationKey}
            {#if !$zenMode}
                <div
                    class="timer-indicator bg-primary pointer-events-none shadow-md"
                    style:animation-play-state={isTimerActive ? "running" : "paused"}
                ></div>
            {/if}
        {/key}
    </div>
    <div class="mx-auto grid w-full max-w-64 grid-cols-2 gap-x-2 gap-y-4">
        <button
            class={`btn ${isTimerActive ? "btn-secondary" : "btn-primary"}`}
            onclick={handleTimerToggle}
            aria-label={isTimerActive ? "Pause Timer" : "Start Timer"}
        >
            {#if isTimerActive}<Pause />{:else}<PlayArrow />{/if}
        </button>
        <div class={`grid grid-cols-[1fr_auto] ${showDeleteButton ? "gap-x-1" : ""}`}>
            <button
                class={`btn ${isTimerActive ? "btn-secondary" : "btn-primary"}`}
                onclick={() => handleReset()}
                aria-label="Reset Timer"
            >
                <Refresh />
            </button>
            {#if showDeleteButton}
                <button class="btn btn-secondary px-3" onclick={handleClear} aria-label="Discard">
                    <Delete />
                </button>
            {/if}
        </div>
        <textarea
            class={`textarea col-span-2 h-10 min-h-10 ${isTimerActive ? "textarea-secondary" : "textarea-primary"}`}
            placeholder="notes"
            bind:value={timerEntry.notes}
        ></textarea>
    </div>
</div>

<style>
    .timer-container-child {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .timer-circle {
        position: relative;
        height: calc(
            100% - (var(--indicator-size) - var(--indicator-size) / var(--line-width-factor))
        );
        width: calc(
            100% - (var(--indicator-size) - var(--indicator-size) / var(--line-width-factor))
        );
        border-radius: 50%;
        border: calc(var(--indicator-size) / var(--line-width-factor)) solid var(--color-primary);
        opacity: 0.25;
    }

    .timer-indicator {
        position: absolute;
        width: var(--indicator-size);
        height: var(--indicator-size);
        border-radius: 50%;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        transform-origin: calc(var(--indicator-size) / 2) var(--container-center-y);
        animation: rotateClockwise var(--rotation-speed) linear infinite;
        transition: opacity 0.15s;
    }

    .timer-time {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .loading {
        width: 50%;
        mask-image: url("data:image/svg+xml,%3Csvg width='44' height='44' viewBox='0 0 44 44' xmlns='http://www.w3.org/2000/svg' stroke='white'%3E%3Cg fill='none' fill-rule='evenodd' stroke-width='2'%3E%3Ccircle cx='22' cy='22' r='1'%3E%3Canimate attributeName='r' begin='0s' dur='4s' values='1;20' calcMode='spline' keyTimes='0;1' keySplines='0.165,0.84,0.44,1' repeatCount='indefinite'/%3E%3Canimate attributeName='stroke-opacity' begin='0s' dur='4s' values='1;0' calcMode='spline' keyTimes='0;1' keySplines='0.3,0.61,0.355,1' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='22' cy='22' r='1'%3E%3Canimate attributeName='r' begin='-0.9s' dur='4s' values='1;20' calcMode='spline' keyTimes='0;1' keySplines='0.165,0.84,0.44,1' repeatCount='indefinite'/%3E%3Canimate attributeName='stroke-opacity' begin='-0.9s' dur='4s' values='1;0' calcMode='spline' keyTimes='0;1' keySplines='0.3,0.61,0.355,1' repeatCount='indefinite'/%3E%3C/circle%3E%3C/g%3E%3C/svg%3E");
    }

    @keyframes rotateClockwise {
        from {
            transform: translateX(-50%) rotate(0deg);
        }
        to {
            transform: translateX(-50%) rotate(360deg);
        }
    }
</style>
