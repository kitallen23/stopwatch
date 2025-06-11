<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { themes } from "$lib";
    import { DEFAULT_THEME_IDENTIFIER, LOCAL_STORAGE_KEYS } from "$lib/config/constants";
    import { formatHex } from "culori";

    import KeyboardArrowDown from "virtual:icons/material-symbols-light/keyboard-arrow-down";
    import CheckCircle from "virtual:icons/material-symbols/check-circle";
    import ThemeIndicator from "$lib/components/ThemeIndicator.svelte";
    import { updateFavicon } from "$lib/favicon";
    import { isAnalyticsReady, trackEvent } from "$lib/stores/analytics";

    let currentAppliedTheme = $state("");

    function updateThemeColor() {
        const oklchColor = getComputedStyle(document.documentElement)
            .getPropertyValue("--color-base-200")
            .trim();

        if (oklchColor) {
            try {
                const hexColor = formatHex(oklchColor);
                const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                if (metaThemeColor && hexColor) {
                    metaThemeColor.setAttribute("content", hexColor);
                }
            } catch {
                console.warn("Failed to convert theme color:", oklchColor);
            }
        }
    }

    onMount(() => {
        if (browser) {
            currentAppliedTheme = document.documentElement.getAttribute("data-theme") || "";

            if (!currentAppliedTheme) {
                const themeFromStorage = localStorage.getItem(LOCAL_STORAGE_KEYS.theme);
                if (themeFromStorage) {
                    document.documentElement.setAttribute("data-theme", themeFromStorage);
                    currentAppliedTheme = themeFromStorage;
                }
            }

            updateThemeColor();
        }

        updateFavicon();
    });

    let hasTrackedPageLoad = $state(false);
    $effect(() => {
        if (browser && $isAnalyticsReady && !hasTrackedPageLoad && currentAppliedTheme) {
            trackEvent("theme__page_load", {
                theme: currentAppliedTheme || DEFAULT_THEME_IDENTIFIER,
            });
            hasTrackedPageLoad = true;
        }
    });

    function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
        const theme = event.currentTarget.getAttribute("aria-label");
        if (theme) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.theme, theme);
            document.documentElement.setAttribute("data-theme", theme);
            currentAppliedTheme = theme;
        }
        updateFavicon();
        trackEvent("theme__set", { theme });
        updateThemeColor();
    }
</script>

<div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-ghost btn-sm px-2" aria-label="Theme picker">
        <ThemeIndicator identifier={currentAppliedTheme} />
        <KeyboardArrowDown />
    </div>
    <div class="dropdown-content bg-base-300 rounded-box z-1 mt-2 w-52 shadow-2xl">
        <ul class="menu w-52">
            <h2 class="menu-title">theme</h2>
            {#each themes as theme (theme)}
                <li>
                    <button
                        name="theme-dropdown"
                        class="theme-controller grid-cols-[auto_auto_1fr]"
                        aria-label={theme}
                        onclick={handleClick}
                    >
                        <ThemeIndicator identifier={theme} />
                        {theme}
                        {#if theme === (currentAppliedTheme || DEFAULT_THEME_IDENTIFIER)}
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
