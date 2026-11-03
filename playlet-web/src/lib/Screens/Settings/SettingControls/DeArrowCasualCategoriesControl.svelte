<script lang="ts">
  import { translate, userPreferencesStore } from "lib/Stores";
  import { PlayletApi } from "lib/Api/PlayletApi";

  const textSizes = ["text-2xl", "text-lg", "text-base", "text-sm", "text-xs"];

  const categories = ["funny", "creative", "clever", "descriptive", "other"];

  const categoryTitles = {
    funny: "Funny",
    creative: "Creative",
    clever: "Clever",
    descriptive: "Descriptive",
    other: "Other",
  };

  export let displayText: string = "";
  export let key: string = "";
  export let description: string = "";
  export let level: number = 0;

  let value;
  let originalValue;
  userPreferencesStore.subscribe((userPreferences) => {
    originalValue = userPreferences[key];
  });

  let modal;

  async function openEditor() {
    value = JSON.parse(JSON.stringify(originalValue));
    modal.showModal();
  }

  async function save() {
    if (key !== "" && value) {
      await PlayletApi.saveUserPreference(key, value);
      const userPreferences = await PlayletApi.getUserPreferences();
      userPreferencesStore.set(userPreferences);
    }
  }

  export function close() {
    modal.close();
  }

  function onClose() {
    // Reset value to original value to avoid weird animation on show
    value = JSON.parse(JSON.stringify(originalValue));
  }
</script>

<div class="m-5">
  <div class={textSizes[level]}>{$translate(displayText)}</div>
  <div class="text-xs text-gray-500">{@html $translate(description)}</div>
  <button class="btn m-1" on:click={openEditor}
    >{$translate(displayText)}</button
  >
</div>

<dialog bind:this={modal} class="modal" on:close={onClose}>
  <div class="modal-box bg-base-100">
    {#if value}
      <table class="w-full">
        <tbody>
          {#each categories as category}
            <tr>
              <td>
                <div>
                  {$translate(categoryTitles[category])}
                </div>
              </td>
              <td>
                <div>
                  <select
                    bind:value={value[category]}
                    class="select select-bordered select-sm"
                  >
                    {#each Array(10) as _, i}
                      <option value={i + 1}>{i + 1}</option>
                    {/each}
                  </select>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      <form method="dialog" class="flex justify-center space-x-2 m-2">
        <button class="btn btn-primary" on:click={save}
          >{$translate("Save")}</button
        >
        <button class="btn btn-primary">{$translate("Close")}</button>
      </form>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>{$translate("Close")}</button>
  </form>
</dialog>
