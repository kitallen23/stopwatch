import { writable } from "svelte/store";

/**
 * A store that provides a counter value that increments every 10 seconds,
 * precisely aligned with clock boundaries (0s, 10s, 20s, 30s, etc.).
 *
 * This counter:
 * - Changes exactly at 10-second boundaries
 * - Can be used to trigger reactive updates in components
 * - Automatically starts when subscribed to and stops when no subscribers remain
 *
 * Usage:
 * Import and use $rerenderKey in reactive statements to trigger
 * component updates every 10 seconds.
 */
function createRerenderTimer() {
    const { subscribe, update } = writable<number>(0);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let subscriberCount = 0;

    const scheduleNextExecution = () => {
        const now = new Date();
        const secondsNow = now.getSeconds();
        const millisNow = now.getMilliseconds();

        // Calculate the next 10s boundary (0, 10, 20, 30, 40, 50)
        const nextTenSecondMark = Math.ceil(secondsNow / 10) * 10;

        // If we're at or past 50 seconds, we need to target the 0 of the next minute
        const targetSeconds = nextTenSecondMark >= 60 ? 0 : nextTenSecondMark;

        // Calculate delay until next 10s boundary in milliseconds
        let delayMs;
        if (nextTenSecondMark >= 60) {
            // Time to next minute's 0 seconds
            delayMs = (60 - secondsNow) * 1000 - millisNow;
        } else {
            // Time to next 10s mark in this minute
            delayMs = (targetSeconds - secondsNow) * 1000 - millisNow;
        }

        // Ensure delay is positive and reasonable
        if (delayMs < 0) delayMs = 10000 + delayMs;
        if (delayMs > 15000) delayMs = 10000; // Safeguard against extreme delays

        timeoutId = setTimeout(() => {
            update((n) => n + 1);
            scheduleNextExecution();
        }, delayMs);
    };

    const start = () => {
        if (subscriberCount === 0) {
            scheduleNextExecution();
        }
        subscriberCount++;
    };

    const stop = () => {
        subscriberCount--;
        if (subscriberCount === 0 && timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return {
        subscribe: (run: (value: number) => void, invalidate?: (value?: number) => void) => {
            start();
            const unsubscribe = subscribe(run, invalidate);
            return () => {
                unsubscribe();
                stop();
            };
        },
    };
}

export const rerenderKey = createRerenderTimer();
