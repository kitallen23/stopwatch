<script lang="ts">
    import "../app.css";
    import Timer from "virtual:icons/material-symbols-light/timer";
    import KeyboardArrowDown from "virtual:icons/material-symbols-light/keyboard-arrow-down";

    let { children } = $props();
</script>

<header class="bg-base-200 fixed top-0 right-0 w-full">
    <div class="mx-auto flex h-10 w-full max-w-4xl items-center justify-between px-4">
        <a href="/" class="app-title flex items-center gap-1"><Timer />stopwatch.</a>
        <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
                Theme
                <KeyboardArrowDown />
            </div>
            <ul class="dropdown-content menu bg-base-300 rounded-box z-1 w-52 shadow-2xl">
                <h2 class="menu-title">theme</h2>
                <li>
                    <button name="theme-dropdown" class="theme-controller" aria-label="default"
                        >default</button
                    >
                </li>
                <li>
                    <button name="theme-dropdown" class="theme-controller" aria-label="retro"
                        >retro</button
                    >
                </li>
                <li>
                    <button name="theme-dropdown" class="theme-controller" aria-label="cyberpunk"
                        >cyberpunk</button
                    >
                </li>
                <li>
                    <button name="theme-dropdown" class="theme-controller" aria-label="valentine"
                        >valentine</button
                    >
                </li>
                <li>
                    <button name="theme-dropdown" class="theme-controller" aria-label="aqua"
                        >aqua</button
                    >
                </li>
            </ul>
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

    .app-title {
        font-family: monospace;
        font-size: 1rem;
    }
</style>
