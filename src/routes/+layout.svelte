<script lang="ts">
    import "../app.css";
    import Timer from "virtual:icons/material-symbols/timer";
    import Flower from "virtual:icons/material-symbols/local-florist";
    import FlowerOutline from "virtual:icons/material-symbols/local-florist-outline";
    import ThemeDropdown from "./ThemeDropdown.svelte";
    import { zenMode } from "$lib/stores/zenMode";

    let { children } = $props();

    function toggleZenMode() {
        zenMode.update((currentValue) => !currentValue);
    }
</script>

<header class="bg-base-200 fixed top-0 right-0 w-full">
    <div class="mx-auto flex h-10 w-full max-w-4xl items-center justify-between gap-2 px-4">
        <a href="/" class="app-title flex items-center gap-1 text-lg"><Timer />stopwatch.</a>
        <div class="flex items-center justify-end gap-2">
            {#if $zenMode}
                <button class="btn btn-ghost btn-sm text-base-content/50" onclick={toggleZenMode}
                    ><span class="hidden sm:inline">zen mode: on </span><Flower
                        class="text-primary"
                    /></button
                >
            {:else}
                <button class="btn btn-ghost btn-sm text-base-content/50" onclick={toggleZenMode}
                    ><FlowerOutline /></button
                >
            {/if}
            <ThemeDropdown />
        </div>
    </div>
</header>

<main class="pt-10">
    {@render children()}
</main>

<style>
    header {
        z-index: 1;
    }
</style>
