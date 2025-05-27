import { derived, writable, type Readable, type Writable } from "svelte/store";
import { browser } from "$app/environment";
import { nanoid } from "nanoid";
import { LOCAL_STORAGE_KEYS } from "$lib/config/constants";
import type { Timer, Timers } from "$lib/types/timer.types";

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

if (browser) {
    timers.subscribe(
        // TODO: Remove
        (value) => console.info(`## Timers updated: `, value)
        // localStorage.setItem(LOCAL_STORAGE_KEYS.timers, JSON.stringify(value))
    );
    chosenTimerId.subscribe(
        // TODO: Remove
        (value) => console.info(`## Chosen timer ID updated: `, value)
        // localStorage.setItem(LOCAL_STORAGE_KEYS.chosenTimerId, JSON.stringify(value))
    );
    // TODO: Remove
    timer.subscribe((value) => console.info(`## Chosen timer updated: `, value));
}
