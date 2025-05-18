<script lang="ts">
    import type { TimerEntry } from "$lib/types/timer.types";
    import Timer from "$lib/components/Timer.svelte";

    let activeStartTime: number | null = $state(null); // Timestamp (ms) when the current active segment started
    let timerInterval: number | undefined = $state(); // Stores the interval ID
    let currentTimeDisplay: string = $state("0.00"); // Formatted time for display

    let timerEntry: TimerEntry = $state({
        id: "",
        notes: "",
        times: [],
        createdAt: null,
    });
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

    function handleTimerToggle() {
        isTimerActive = !isTimerActive;

        if (isTimerActive) {
            // Starting the timer
            activeStartTime = Date.now();
            if (!timerEntry.createdAt) {
                // Set createdAt on first start of an entry
                timerEntry.createdAt = activeStartTime;
            }
            timerInterval = setInterval(() => {
                currentTimeDisplay = formatTime(calculateTotalElapsedTimeMs());
            }, 100); // Update display every 100ms
        } else {
            // Stopping the timer
            if (activeStartTime) {
                timerEntry.times.push([activeStartTime, Date.now()]);
                activeStartTime = null;
            }
            clearInterval(timerInterval);

            timerInterval = undefined;
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

        clearInterval(timerInterval);
        timerInterval = undefined;
        isTimerActive = false;
        activeStartTime = null;
        timerEntry.times = [];
        timerEntry.createdAt = null;
        timerEntry.notes = "";
        currentTimeDisplay = formatTime(0);
        animationKey++;
    }
</script>

<div class="mx-auto mt-8 w-full max-w-4xl px-4">
    <Timer
        {currentTimeDisplay}
        {isTimerActive}
        {animationKey}
        toggle={handleTimerToggle}
        reset={handleTimerReset}
        notes={timerEntry.notes}
    />
</div>
