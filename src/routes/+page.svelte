<script lang="ts">
    import type { TimerEntry } from "$lib/types/timer.types";
    import Timer from "$lib/components/Timer.svelte";

    let activeStartTime: number | null = $state(null); // Timestamp (ms) when the current active segment started
    let currentTimeDisplay: string = $state("0.00"); // Formatted time for display

    // Stores the animation frame ID - note that this must not use $state, as we don't want svelte
    // to update based on this value changing
    let animationFrameId: number | null = null;

    const BLANK_TIMER_ENTRY = {
        id: "",
        notes: "",
        times: [],
        createdAt: null,
    };

    function blankTimerEntry() {
        return { ...BLANK_TIMER_ENTRY, id: "" };
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
     * Formats milliseconds into MM:SS.ss format.
     * @param {number} ms - The total elapsed time in milliseconds.
     * @returns {string} The formatted time string.
     */
    function formatTime(ms: number): string {
        const totalSeconds = ms / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const hundredths = Math.floor((seconds * 100) % 100);

        const formattedMinutes = String(minutes);
        const formattedSecondsShort = String(Math.floor(seconds));
        const formattedSecondsLong = String(Math.floor(seconds)).padStart(2, "0");
        const formattedHundredths = String(hundredths).padStart(2, "0");

        if (minutes > 0) {
            return `${formattedMinutes}:${formattedSecondsLong}.${formattedHundredths}`;
        }
        return `${formattedSecondsShort}.${formattedHundredths}`;
    }

    /**
     * The main loop for updating the timer display using requestAnimationFrame.
     * This function is called by the browser just before the next screen repaint
     * when the timer is active.
     */
    function runTimerLoop() {
        // Recalculate the total elapsed time and format it for display.
        // This ensures the displayed time is always up-to-date for the current frame.
        currentTimeDisplay = formatTime(calculateTotalElapsedTimeMs());

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

    /**
     * Resets the timer animation to its starting position and pauses it.
     */
    function handleTimerReset() {
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
            console.info(`Adding timer entry: `, timerEntry);
        }

        timerEntry = blankTimerEntry();
        isTimerActive = false;
        activeStartTime = null;
        currentTimeDisplay = formatTime(0);
        animationKey++;
    }
</script>

<div class="mx-auto mt-8 w-full max-w-4xl px-4">
    <Timer
        {currentTimeDisplay}
        {isTimerActive}
        {animationKey}
        bind:notes={timerEntry.notes}
        toggle={handleTimerToggle}
        reset={handleTimerReset}
    />
</div>
