<script lang="ts">
    import { browser } from "$app/environment";
    import { nanoid } from "nanoid";
    import WindowClose from "virtual:icons/mdi/window-close";
    import Plus from "virtual:icons/mdi/plus";
    import Pencil from "virtual:icons/mdi/pencil";
    import Delete from "virtual:icons/material-symbols/delete-outline";
    import {
        timers,
        chosenTimerId,
        addTimer,
        editTimer,
        timer,
        deleteTimer,
    } from "$lib/stores/timers";
    import { trackEvent } from "$lib/stores/analytics";

    let isHydrated = $state(false);
    $effect(() => {
        // Mark as hydrated after first tick when localStorage has loaded
        if (browser) {
            setTimeout(() => (isHydrated = true), 0);
        } else {
            isHydrated = true;
        }
    });

    let timerOptions = $derived(
        [...Object.entries($timers || [])]
            .map(([id, timer]) => {
                return {
                    value: id,
                    label: timer.entries.length
                        ? `${timer.name} (${timer.entries.length})`
                        : timer.name,
                };
            })
            .sort((a, b) => a.label.toLowerCase().localeCompare(b.label))
    );

    let isAddModalOpen = $state(false);
    let addTimerValue = $state("");
    let addTimerError = $state("");
    let addTimerModalElement: HTMLDialogElement | undefined = $state(undefined);
    let addTimerInputFieldElement: HTMLInputElement | undefined = $state(undefined);

    $effect(() => {
        if (isAddModalOpen) {
            addTimerModalElement?.showModal();
            setTimeout(() => addTimerInputFieldElement?.focus(), 100);
        } else {
            if (addTimerInputFieldElement) {
                addTimerValue = "";
            }
            addTimerError = "";
            addTimerModalElement?.close();
        }
    });

    function handleAddTimer() {
        if (!addTimerValue) {
            addTimerError = "cannot be blank";
        } else if (
            Object.values($timers)
                .map((item) => item.name)
                .includes(addTimerValue)
        ) {
            addTimerError = "a timer already exists with this name";
        } else {
            const newId = nanoid(8);
            addTimer({
                id: newId,
                name: addTimerValue,
                entries: [],
            });
            isAddModalOpen = false;
            trackEvent("timer__add");
        }
    }

    let isModifyModalOpen = $state(false);
    let modifyTimerValue = $state("");
    let modifyTimerError = $state("");
    let modifyTimerModalElement: HTMLDialogElement | undefined = $state(undefined);
    let modifyTimerInputFieldElement: HTMLInputElement | undefined = $state(undefined);

    $effect(() => {
        if (isModifyModalOpen) {
            modifyTimerModalElement?.showModal();
            modifyTimerValue = $timers[$chosenTimerId].name;
            setTimeout(() => modifyTimerInputFieldElement?.focus(), 100);
        } else {
            if (modifyTimerInputFieldElement) {
                modifyTimerValue = "";
            }
            modifyTimerError = "";
            modifyTimerModalElement?.close();
        }
    });

    function handleModifyTimer() {
        if (!modifyTimerValue) {
            modifyTimerError = "cannot be blank";
        } else {
            let allOtherTimers = Object.values($timers).filter(
                (item) => item.id !== $chosenTimerId
            );
            let isUnique = !allOtherTimers.map((item) => item.name).includes(modifyTimerValue);
            if (!isUnique) {
                modifyTimerError = "a timer already exists with this name";
            } else {
                editTimer({
                    name: modifyTimerValue,
                });
                isModifyModalOpen = false;
                trackEvent("timer__edit");
            }
        }
    }

    let isDeleteModalOpen = $state(false);
    let deleteTimerModalElement: HTMLDialogElement | undefined = $state(undefined);

    $effect(() => {
        if (isDeleteModalOpen) {
            deleteTimerModalElement?.showModal();
        } else {
            deleteTimerModalElement?.close();
        }
    });

    function handleDeleteTimer() {
        deleteTimer();
        isDeleteModalOpen = false;
        trackEvent("timer__delete");
    }
</script>

{#if isHydrated}
    <div class="mx-auto grid w-full max-w-sm min-w-64 gap-4 px-6">
        <div class="mx-auto grid w-full max-w-64 min-w-64 gap-4">
            <div class="flex gap-x-2">
                <select
                    class="select select-primary"
                    bind:value={$chosenTimerId}
                    aria-label="Select timer"
                >
                    {#each timerOptions as option (option.value)}
                        <option value={option.value}>{option.label}</option>
                    {/each}
                </select>
                <button
                    class="btn btn-primary btn-outline px-2"
                    onclick={() => (isModifyModalOpen = true)}
                    aria-label="Edit or delete current timer"
                >
                    <Pencil />
                </button>
                <button
                    class="btn btn-primary btn-outline px-2"
                    onclick={() => (isAddModalOpen = true)}
                    aria-label="Add new timer"
                >
                    <Plus />
                </button>
            </div>
        </div>
    </div>
{/if}

<dialog
    id="add_timer_modal"
    class="modal"
    onclose={() => (isAddModalOpen = false)}
    onclick={(e) => e.target === addTimerModalElement && (isAddModalOpen = false)}
    bind:this={addTimerModalElement}
>
    <div class="modal-box max-w-sm">
        <button
            class="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content absolute top-2 right-2"
            aria-label="Cancel & close modal"
            onclick={() => (isAddModalOpen = false)}
        >
            <WindowClose />
        </button>
        <div class="grid gap-y-4">
            <h3 class="text-lg font-bold">add timer</h3>
            <fieldset class="fieldset">
                <input
                    type="text"
                    class={`input ${addTimerError ? "input-error" : "input-primary"} w-full`}
                    placeholder="name"
                    bind:value={addTimerValue}
                    bind:this={addTimerInputFieldElement}
                    onkeydown={(e) => e.key === "Enter" && handleAddTimer()}
                    enterkeyhint="done"
                />
                {#if addTimerError}
                    <p class="label text-error">{addTimerError}</p>
                {/if}
            </fieldset>
            <div class="flex w-full justify-between">
                <button class="btn btn-ghost" onclick={() => (isAddModalOpen = false)}>
                    cancel
                </button>
                <button class="btn btn-primary" onclick={handleAddTimer}>add</button>
            </div>
        </div>
    </div>
</dialog>

<dialog
    id="modify_timer_modal"
    class="modal"
    onclose={() => (isModifyModalOpen = false)}
    onclick={(e) => e.target === modifyTimerModalElement && (isModifyModalOpen = false)}
    bind:this={modifyTimerModalElement}
>
    <div class="modal-box max-w-sm">
        <button
            class="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content absolute top-2 right-2"
            aria-label="Cancel & close modal"
            onclick={() => (isModifyModalOpen = false)}
        >
            <WindowClose />
        </button>
        <div class="grid gap-y-4">
            <h3 class="text-lg font-bold">delete timer</h3>
            <button
                class="btn btn-error"
                onclick={() => {
                    isModifyModalOpen = false;
                    isDeleteModalOpen = true;
                }}
                disabled={timerOptions.length <= 1}
            >
                <Delete />delete
            </button>
            <div class="divider text-base-content/60">or</div>
            <h3 class="text-lg font-bold">rename timer</h3>
            <fieldset class="fieldset">
                <input
                    type="text"
                    class={`input ${modifyTimerError ? "input-error" : "input-primary"} w-full`}
                    placeholder="name"
                    bind:value={modifyTimerValue}
                    bind:this={modifyTimerInputFieldElement}
                    onkeydown={(e) => e.key === "Enter" && handleModifyTimer()}
                    enterkeyhint="done"
                />
                {#if modifyTimerError}
                    <p class="label text-error">{modifyTimerError}</p>
                {/if}
            </fieldset>
            <div class="flex w-full justify-between">
                <button class="btn btn-ghost" onclick={() => (isModifyModalOpen = false)}>
                    cancel
                </button>
                <button class="btn btn-primary" onclick={handleModifyTimer}>rename</button>
            </div>
        </div>
    </div>
</dialog>

<dialog
    id="delete_timer_modal"
    class="modal"
    onclose={() => (isDeleteModalOpen = false)}
    onclick={(e) => e.target === deleteTimerModalElement && (isDeleteModalOpen = false)}
    bind:this={deleteTimerModalElement}
>
    <div class="modal-box max-w-sm">
        <button
            class="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content absolute top-2 right-2"
            aria-label="Cancel & close modal"
            onclick={() => (isDeleteModalOpen = false)}
        >
            <WindowClose />
        </button>
        <div class="grid gap-y-4">
            <h3 class="text-lg font-bold">delete timer</h3>
            <p class="py-4">
                are you sure you wish to delete the timer '<span class="font-bold"
                    >{$timer?.name}</span
                >' and all of its history?
            </p>
            <div class="flex w-full justify-between">
                <button class="btn btn-ghost" onclick={() => (isDeleteModalOpen = false)}>
                    cancel
                </button>
                <button class="btn btn-primary" onclick={handleDeleteTimer}>yes</button>
            </div>
        </div>
    </div>
</dialog>
