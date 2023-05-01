<script lang="ts">
  import { goto } from "$app/navigation";
  import { createLink, validateSlug, validateURL } from "../util/api";
  import { fly } from "svelte/transition";

  const delay = 500;

  let slug = "";
  let slugError = "";
  let slugTimeoutId = 0;

  let url = "";
  let urlError = "";
  let urlTimeoutId = 0;

  let submitting = false;
  let submitError = "";

  $: disableCreate = Boolean(
    !url || submitting || urlTimeoutId || urlError || slugTimeoutId || slugError,
  );

  /**
   * Wait 500ms after slug input stops changing and then validate it
   */
  function onInputSlug() {
    clearTimeout(slugTimeoutId);
    slugTimeoutId = 0;
    slugError = "";
    submitError = "";
    if (slug) {
      slugTimeoutId = setTimeout(async () => {
        const result = await validateSlug(slug);
        slugError = result.error || "";
        slugTimeoutId = 0;
      }, delay);
    }
  }

  /**
   * Wait 500ms after url input stops changing and then validate it
   */
  function onInputUrl() {
    clearTimeout(urlTimeoutId);
    urlTimeoutId = 0;
    urlError = "";
    submitError = "";
    if (url) {
      urlTimeoutId = setTimeout(async () => {
        const result = await validateURL(url);
        urlError = result.error || "";
        urlTimeoutId = 0;
      }, delay);
    }
  }

  /**
   * Attempt to create the link and redirect to the management page on success
   */
  async function onSubmitForm() {
    submitting = true;
    const link = await createLink(url, slug);
    submitting = false;
    if ("error" in link) {
      submitError = link.error;
      return;
    }
    goto(`/lnk/${link.id}`);
  }
</script>

<h3>Make a little URL</h3>

<form class:disabled={submitting} on:submit|preventDefault={onSubmitForm}>
  <div class="row flex-center">
    <div class="col sm-7">
      <div class="form-group">
        <label for="url">URL</label>
        <input
          bind:value={url}
          class="input-block"
          disabled={submitting}
          name="url"
          placeholder="Enter a URL to shorten"
          required
          type="text"
          on:input={onInputUrl}
        />
      </div>
      {#if urlTimeoutId || urlError}
        <div class="margin-top" transition:fly>
          {#if urlTimeoutId}
            <small>Checking...</small>
          {:else if urlError}
            <small class="text-danger">{urlError}</small>
          {/if}
        </div>
      {/if}
    </div>
    <div class="col sm-5">
      <div class="form-group">
        <label for="slug">Slug (optional)</label>
        <input
          bind:value={slug}
          class="input-block"
          disabled={submitting}
          name="slug"
          placeholder="Enter a slug to use"
          type="text"
          on:input={onInputSlug}
        />
        {#if slugTimeoutId || slugError}
          <div class="margin-top" transition:fly>
            {#if slugTimeoutId}
              <small>Checking...</small>
            {:else if slugError}
              <small class="text-danger">{slugError}</small>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    {#if submitError}
      <div class="col col-12" transition:fly>
        <div class="alert alert-danger text-center">{submitError}</div>
      </div>
    {/if}
  </div>

  <div class="row flex-center">
    <button disabled={disableCreate}>Create</button>
  </div>
</form>
