<script lang="ts">
    type ThemeIndicatorProps = {
        identifier: string;
    };
    let { identifier }: ThemeIndicatorProps = $props();
</script>

<div
    data-theme={identifier}
    class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
>
    <div class="bg-base-content size-1 rounded-full"></div>
    <div class="bg-primary size-1 rounded-full"></div>
    <div class="bg-secondary size-1 rounded-full"></div>
    <div class="bg-accent size-1 rounded-full"></div>
</div>
