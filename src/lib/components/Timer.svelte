<script lang="ts">
    import { onMount } from "svelte";
    import PlayArrow from "virtual:icons/material-symbols/play-arrow";
    import Pause from "virtual:icons/material-symbols/pause";
    import Refresh from "virtual:icons/material-symbols/refresh";

    interface TimerProps {
        toggle: () => void;
        reset: () => void;
        currentTimeDisplay: string;
        isTimerActive: boolean;
        animationKey: number;
        notes: string;
    }

    let {
        toggle,
        reset,
        currentTimeDisplay,
        isTimerActive,
        animationKey,
        notes = $bindable(),
    }: TimerProps = $props();

    // Internal state for visuals
    const indicatorSize = "1.25rem";
    const lineWidthFactor = "3";
    const rotationSpeed = "4s";
    let containerCenterY = $state("0px");

    let timerContainerElement: HTMLDivElement;

    onMount(() => {
        if (timerContainerElement) {
            const updateIndicatorTransformOrigin = () => {
                const containerHeight = timerContainerElement.offsetHeight;
                containerCenterY = `${containerHeight / 2}px`;
            };

            updateIndicatorTransformOrigin();
            const resizeObserver = new ResizeObserver(updateIndicatorTransformOrigin);
            resizeObserver.observe(timerContainerElement);

            return () => {
                resizeObserver.disconnect();
            };
        }
    });
</script>

<div class="mx-auto grid max-w-sm min-w-64 gap-4 p-6">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="timer-container-child aspect-square"
        style="--indicator-size: {indicatorSize}; --rotation-speed: {rotationSpeed};
        --container-center-y: {containerCenterY}; --line-width-factor: {lineWidthFactor}"
        bind:this={timerContainerElement}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="timer-circle cursor-pointer" onclick={toggle}></div>
        <div class="timer-time pointer-events-none text-4xl sm:text-5xl">
            {currentTimeDisplay}
        </div>
        {#key animationKey}
            <div
                class="timer-indicator bg-primary shadow-md"
                style:animation-play-state={isTimerActive ? "running" : "paused"}
            ></div>
        {/key}
    </div>
    <div class="mx-auto grid w-full max-w-64 grid-cols-2 gap-x-2 gap-y-4">
        <button class={`btn ${isTimerActive ? "btn-secondary" : "btn-primary"}`} onclick={toggle}>
            {#if isTimerActive}<Pause />{:else}<PlayArrow />{/if}
        </button>
        <button class={`btn ${isTimerActive ? "btn-secondary" : "btn-primary"}`} onclick={reset}>
            <Refresh />
        </button>
        <textarea class="textarea col-span-2 h-10 min-h-10" placeholder="notes" bind:value={notes}
        ></textarea>
    </div>
</div>

<style>
    .timer-container-child {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .timer-circle {
        position: relative;
        height: calc(
            100% - (var(--indicator-size) - var(--indicator-size) / var(--line-width-factor))
        );
        width: calc(
            100% - (var(--indicator-size) - var(--indicator-size) / var(--line-width-factor))
        );
        border-radius: 50%;
        border: calc(var(--indicator-size) / var(--line-width-factor)) solid var(--color-primary);
        opacity: 0.25;
    }

    .timer-indicator {
        position: absolute;
        width: var(--indicator-size);
        height: var(--indicator-size);
        border-radius: 50%;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        transform-origin: calc(var(--indicator-size) / 2) var(--container-center-y);
        animation: rotateClockwise var(--rotation-speed) linear infinite;
        transition: opacity 0.15s;
    }

    .timer-time {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    @keyframes rotateClockwise {
        from {
            transform: translateX(-50%) rotate(0deg);
        }
        to {
            transform: translateX(-50%) rotate(360deg);
        }
    }
</style>
