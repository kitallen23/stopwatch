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

/**
 * Store containing all timers data
 * @type {Writable<Timers>}
 */
export const timers: Writable<Timers> = writable<Timers>(
    browser
        ? JSON.parse(
              localStorage.getItem(LOCAL_STORAGE_KEYS.timers) || JSON.stringify(defaultValue)
          )
        : defaultValue
);

// Initialize chosenTimer after timers is created
const initialTimerValue = browser
    ? localStorage.getItem(LOCAL_STORAGE_KEYS.chosenTimerId) || initialTimerId
    : initialTimerId;

export const chosenTimerId: Writable<string> = writable<string>(initialTimerValue);

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

if (browser) {
    timers.subscribe((value) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.timers, JSON.stringify(value));
    });

    chosenTimerId.subscribe((value) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.chosenTimerId, value);
    });
}
