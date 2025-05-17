<script lang="ts">
    import { browser } from "$app/environment";
    import { themes } from "$lib";
    import ThemeIndicator from "$lib/components/ThemeIndicator.svelte";
    import { LOCAL_STORAGE_KEYS } from "$lib/config/ constants";
    import KeyboardArrowDown from "virtual:icons/material-symbols-light/keyboard-arrow-down";
    import CheckCircle from "virtual:icons/material-symbols/check-circle";

    let currentAppliedTheme = "";

    if (browser) {
        currentAppliedTheme = document.documentElement.getAttribute("data-theme") || "";

        if (!currentAppliedTheme) {
            const themeFromStorage = localStorage.getItem(LOCAL_STORAGE_KEYS.theme);
            if (themeFromStorage) {
                document.documentElement.setAttribute("data-theme", themeFromStorage);
                currentAppliedTheme = themeFromStorage;
            }
        }
    }

    function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
        const theme = event.currentTarget.getAttribute("aria-label");
        if (theme) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.theme, theme);
            document.documentElement.setAttribute("data-theme", theme);
            currentAppliedTheme = theme;
        }
    }
</script>

<div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-ghost btn-sm px-2">
        <ThemeIndicator identifier={currentAppliedTheme} />
        <KeyboardArrowDown />
    </div>
    <div class="dropdown-content bg-base-300 rounded-box z-1 mt-2 w-52 shadow-2xl">
        <ul class="menu w-52">
            <h2 class="menu-title">theme</h2>
            {#each themes as theme}
                <li>
                    <button
                        name="theme-dropdown"
                        class="theme-controller grid-cols-[auto_auto_1fr]"
                        aria-label={theme}
                        on:click={handleClick}
                    >
                        <ThemeIndicator identifier={theme} />
                        {theme}
                        {#if theme === currentAppliedTheme}
                            <div class="flex items-center justify-end">
                                <CheckCircle />
                            </div>
                        {/if}
                    </button>
                </li>
            {/each}
        </ul>
    </div>
</div>

<style>
    .dropdown-content {
        height: 30em;
        max-height: calc(100vh - (var(--spacing) * 4) - (var(--spacing) * 10));
        overflow-y: auto;
    }
</style>
