import { derived, get, writable, type Readable, type Writable } from "svelte/store";
import { browser } from "$app/environment";
import { nanoid } from "nanoid";
import { LOCAL_STORAGE_KEYS } from "$lib/config/constants";
import type { Timer, TimerEntry, Timers } from "$lib/types/timer.types";

const initialTimerId = nanoid(8);
const defaultValue: Timers = {
    [initialTimerId]: {
        id: initialTimerId,
        name: "default",
        entries: [],
    },
};

const getValidTimerId = (timersData: Timers, preferredId?: string): string => {
    // If preferred ID exists in timers, use it
    if (preferredId && timersData[preferredId]) {
        return preferredId;
    }

    // Otherwise, get the first available timer ID
    const timerIds = Object.keys(timersData);
    return timerIds.length > 0 ? timerIds[0] : initialTimerId;
};

const storedTimers = (() => {
    if (browser) {
        try {
            const timersString = localStorage.getItem(LOCAL_STORAGE_KEYS.timers);
            if (timersString) {
                const timersObj: Timers = JSON.parse(timersString);
                if (Object.keys(timersObj).length) {
                    return timersObj;
                }
            }
        } catch {} // eslint-disable-line no-empty
    }
    return defaultValue;
})();

const storedChosenTimerId = browser ? localStorage.getItem(LOCAL_STORAGE_KEYS.chosenTimerId) : null;

/**
 * Store containing all timers data
 * @type {Writable<Timers>}
 */
export const timers: Writable<Timers> = writable<Timers>(storedTimers);

export const chosenTimerId: Writable<string> = writable<string>(
    getValidTimerId(storedTimers, storedChosenTimerId || undefined)
);

// Derived store to automatically sync chosenTimerId when timers change
const syncChosenTimer = derived([timers, chosenTimerId], ([$timers, $chosenTimerId]) => {
    const validId = getValidTimerId($timers, $chosenTimerId);
    if (validId !== $chosenTimerId) {
        chosenTimerId.set(validId);
    }
    return validId;
});
syncChosenTimer.subscribe(() => {});

/**
 * Derived store that contains the currently selected timer object
 * Updates automatically when either timers or chosenTimerId changes
 */
export const timer: Readable<Timer | undefined> = derived(
    [timers, chosenTimerId],
    ([$timers, $chosenTimerId]) => {
        return $timers[$chosenTimerId];
    }
);

/**
 * *****************************************************************************
 * Timer mutators **************************************************************
 * *****************************************************************************
 */

/**
 * Adds a new timer to the timers collection and sets it as the currently selected timer
 * @param timer - The timer object to add
 */
export function addTimer(timer: Timer): void {
    timers.update(($timers) => {
        $timers[timer.id] = timer;
        return $timers;
    });
    chosenTimerId.set(timer.id);
}

/**
 * Updates the currently selected timer with the provided partial timer data
 * @param timer - Partial timer object containing fields to update
 */
export function editTimer(timer: Partial<Timer>): void {
    timers.update(($timers) => {
        const currentTimerId = get(chosenTimerId);
        if ($timers[currentTimerId]) {
            $timers[currentTimerId] = {
                ...$timers[currentTimerId],
                ...timer,
            };
        }
        return $timers;
    });
}

/**
 * Deletes the currently selected timer from the timers store.
 */
export function deleteTimer(): void {
    // Return early if there is only one timer left
    const currentTimers = get(timers);
    if (Object.keys(currentTimers).length <= 1) {
        return;
    }

    timers.update(($timers) => {
        const currentTimerId = get(chosenTimerId);
        delete $timers[currentTimerId];
        return $timers;
    });
}

/**
 * *****************************************************************************
 * Timer entry mutators ********************************************************
 * *****************************************************************************
 */

/**
 * Adds a new timer entry to the currently selected timer
 * @param timerEntry - The timer entry object to add
 */
export function addTimerEntry(timerEntry: TimerEntry): void {
    timers.update(($timers) => {
        const currentTimerId = get(chosenTimerId);
        const currentTimer = $timers[currentTimerId];

        if (currentTimer) {
            currentTimer.entries.push(timerEntry);
        }

        return $timers;
    });
}

/**
 * Removes a timer entry from the currently selected timer
 * @param entryId - ID of the entry to remove
 */
export function removeTimerEntry(entryId: string): void {
    timers.update(($timers) => {
        const currentTimerId = get(chosenTimerId);
        const currentTimer = $timers[currentTimerId];

        if (currentTimer) {
            currentTimer.entries = currentTimer.entries.filter((entry) => entry.id !== entryId);
        }

        return $timers;
    });
}

/**
 * Updates a timer entry in the currently selected timer
 * @param entryId - ID of the entry to update
 * @param updates - Partial timer entry object with fields to update
 */
export function updateTimerEntry(entryId: string, updates: Partial<TimerEntry>): void {
    timers.update(($timers) => {
        const currentTimerId = get(chosenTimerId);
        const currentTimer = $timers[currentTimerId];

        if (currentTimer) {
            const entryIndex = currentTimer.entries.findIndex((entry) => entry.id === entryId);
            if (entryIndex !== -1) {
                currentTimer.entries[entryIndex] = {
                    ...currentTimer.entries[entryIndex],
                    ...updates,
                };
            }
        }

        return $timers;
    });
}

/**
 * Clears all timer entries from the currently selected timer
 */
export function clearTimerEntries(): void {
    timers.update(($timers) => {
        const currentTimerId = get(chosenTimerId);
        const currentTimer = $timers[currentTimerId];

        if (currentTimer) {
            currentTimer.entries = [];
        }

        return $timers;
    });
}

if (browser) {
    timers.subscribe((value) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.timers, JSON.stringify(value));
    });

    chosenTimerId.subscribe((value) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.chosenTimerId, value);
    });
}
