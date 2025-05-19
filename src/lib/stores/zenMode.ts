import { writable, type Writable } from "svelte/store";
import { browser } from "$app/environment";
import { LOCAL_STORAGE_KEYS } from "$lib/config/constants";

const defaultValue = false;

/**
 * Represents the Zen mode state, synchronized with localStorage.
 * @type {Writable<boolean>}
 */
export const zenMode: Writable<boolean> = writable<boolean>(
    browser ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.zenMode) || "false") : defaultValue
);

if (browser) {
    zenMode.subscribe((value) =>
        localStorage.setItem(LOCAL_STORAGE_KEYS.zenMode, JSON.stringify(value))
    );
}
