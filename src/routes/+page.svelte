<script lang="ts">
    import { onMount } from "svelte";

    let indicatorSize = "1.25rem";
    let lineWidthFactor = "3";
    let rotationSpeed = "4s";
    // This variable will be dynamically set based on container height
    let containerCenterY = "0px";

    onMount(() => {
        const containerElement = document.querySelector(".timer-container") as HTMLElement;
        const indicatorElement = document.querySelector(".timer-indicator") as HTMLElement;

        if (containerElement && indicatorElement) {
            const updateIndicatorTransformOrigin = () => {
                const containerHeight = containerElement.offsetHeight;
                containerCenterY = `${containerHeight / 2}px`;
            };

            // Initial setup
            updateIndicatorTransformOrigin();

            // Observe container size changes
            const resizeObserver = new ResizeObserver(updateIndicatorTransformOrigin);
            resizeObserver.observe(containerElement);

            // Cleanup observer when component is destroyed
            return () => {
                resizeObserver.disconnect();
            };
        }
    });
</script>

<div class="mx-auto mt-8 w-full max-w-4xl px-4">
    <div class="card mx-auto max-w-sm">
        <div class="card-body">
            <div
                class="timer-container aspect-square"
                style="--indicator-size: {indicatorSize}; --rotation-speed: {rotationSpeed}; --container-center-y: {containerCenterY}; --line-width-factor: {lineWidthFactor}"
            >
                <div class="timer-circle"></div>
                <div class="timer-indicator shadow-md"></div>
            </div>
        </div>
    </div>
</div>

<style>
    .timer-container {
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
        background-color: var(--color-primary);
        border-radius: 50%;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        transform-origin: calc(var(--indicator-size) / 2) var(--container-center-y);
        animation: rotateClockwise var(--rotation-speed) linear infinite;
        /* animation: rotateClockwise var(--rotation-speed) linear; */
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
