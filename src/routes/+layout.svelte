<script lang="ts">
    import "../app.css";
    import Timer from "virtual:icons/material-symbols/timer";
    import YinYang from "virtual:icons/mdi/yin-yang";
    import Github from "virtual:icons/mdi/github";
    import ThemeDropdown from "./ThemeDropdown.svelte";
    import { zenMode } from "$lib/stores/zenMode";
    import { APP_VERSION, GITHUB_REPO_URL, GITHUB_USER_URL } from "$lib/config/constants";

    let { children } = $props();

    function toggleZenMode() {
        zenMode.update((currentValue) => !currentValue);
    }
</script>

<header class="bg-base-200 fixed top-0 right-0 w-full">
    <div class="mx-auto flex h-10 w-full max-w-2xl items-center justify-between gap-2 px-4">
        <a href="/" class="app-title flex items-center gap-1 text-lg"
            ><Timer aria-hidden="true" />stopwatch.</a
        >
        <div class="flex items-center justify-end gap-2">
            {#if $zenMode}
                <button
                    class="btn btn-ghost btn-sm text-base-content/60"
                    onclick={toggleZenMode}
                    aria-label="Toggle zen mode"
                >
                    <span class="mr-1 hidden sm:inline">zen mode: on</span>
                    <YinYang class="text-primary" aria-hidden="true" />
                </button>
            {:else}
                <button
                    class="btn btn-ghost btn-sm text-base-content/60"
                    onclick={toggleZenMode}
                    aria-label="Toggle zen mode"
                >
                    <YinYang aria-hidden="true" />
                </button>
            {/if}
            <ThemeDropdown />
        </div>
    </div>
</header>

<main class="pt-10">
    {@render children()}
</main>

<footer class="footer bg-base-200 text-base-content/60 place-items-end px-2 py-1">
    <aside class="w-full">
        <div class="mx-auto flex w-full max-w-2xl items-center justify-end gap-10 text-xs">
            <span>app v{APP_VERSION}</span>
            <div class="flex items-center">
                <span
                    >made by <a
                        class="link link-hover"
                        href={GITHUB_USER_URL}
                        target="_blank"
                        rel="noopener noreferrer">@kitallen23</a
                    ></span
                >
                <a
                    class="btn btn-ghost btn-xs"
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View source code on GitHub"><Github aria-hidden="true" /></a
                >
            </div>
        </div>
    </aside>
</footer>

<style>
    header {
        z-index: 1;
    }
</style>
