<script lang="ts">
    import Timer from "$lib/components/Timer.svelte";
    import TimerHistory from "$lib/components/TimerHistory.svelte";
    import TimerPicker from "$lib/components/TimerPicker.svelte";
</script>

<div class="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 px-0 pt-8 pb-6 sm:px-4">
    <Timer />
    <TimerPicker />
    <TimerHistory />
</div>
