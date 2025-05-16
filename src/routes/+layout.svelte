<script lang="ts">
    import "../app.css";
    import Timer from "virtual:icons/material-symbols-light/timer";

    let { children } = $props();
</script>

<header class="bg-base-200 fixed top-0 right-0 w-full shadow-md">
    <div class="mx-auto flex h-10 w-full max-w-4xl items-center justify-between px-4">
        <a href="/" class="app-title flex items-center gap-1"><Timer />stopwatch.</a>
    </div>
</header>

<main class="pt-10">
    {@render children()}
</main>

<style>
    header {
        z-index: 1;
    }

    .app-title {
        font-family: monospace;
        font-size: 1rem;
    }
</style>
