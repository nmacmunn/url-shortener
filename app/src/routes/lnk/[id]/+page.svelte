<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import { env } from "$env/dynamic/public";
  import { deleteLink } from "../../../util/api.js";

  export let data;

  let copyOpen = false;
  let copyText = "";
  let deleteError = "";
  let deleteOpen = false;
  let shortUrl = `${$page.url.origin}/${data.link.slug}`;

  /**
   * Show a modal when user clicks the copy button. `navigator.clipboard` is
   * not always available so handle the possible error.
   */
  function onClickCopy() {
    try {
      navigator.clipboard.writeText(shortUrl);
      copyText = "Your link has been copied to the clipboard.";
    } catch {
      copyText = "Failed to copy link.";
    }
    copyOpen = true;
  }

  /**
   * Attempt to delete the link (set the deletedAt time) and then refresh the
   * page. Shows an error on failure.
   */
  async function onClickDelete() {
    const result = await deleteLink(data.link.id);
    if (result.error) {
      deleteError = result.error;
    } else {
      invalidateAll();
    }
  }
</script>

<svelte:head>
  <title>{env.PUBLIC_APP_NAME} - {data.link.slug}</title>
</svelte:head>

<h3>Manage your link</h3>

<table>
  <tbody>
    <tr>
      <td><strong>View Count</strong></td>
      <td>{data.link.viewCount}</td>
      <td />
    </tr>
    <tr>
      <td><strong>Short URL</strong></td>
      <td>{shortUrl}</td>
      <td>
        {#if !data.link.deletedAt}
          <a href={""} on:click|preventDefault={onClickCopy}>copy</a>
        {/if}
      </td>
    </tr>
    <tr>
      <td><strong>Long URL</strong></td>
      <td>{data.link.url}</td>
      <td>
        {#if !data.link.deletedAt}
          <a href={data.link.url} target="_blank">test</a>
        {/if}
      </td>
    </tr>
    <tr>
      <td><strong>Created</strong></td>
      <td>{new Date(data.link.createdAt).toLocaleString()}</td>
      <td>
        {#if !data.link.deletedAt}
          <a href={""} on:click|preventDefault={() => (deleteOpen = true)}>delete</a>
        {/if}
      </td>
    </tr>
    {#if data.link.deletedAt}
      <tr>
        <td><strong>Deleted</strong></td>
        <td>{new Date(data.link.deletedAt).toLocaleString()}</td>
        <td />
      </tr>
    {/if}
  </tbody>
</table>

<p>Tips</p>
<ul>
  <li>Bookmark this page. There's no way to look it up later.</li>
  <li>Anyone you share this page with can delete the link.</li>
</ul>

<!-- delete modal -->
<input class="modal-state" id="delete-modal" type="checkbox" bind:checked={deleteOpen} />
<div class="modal">
  <label class="modal-bg" for="delete-modal" />
  <div class="modal-body">
    <label class="btn-close" for="delete-modal">X</label>
    <h4 class="modal-title">Delete Link</h4>
    <p class="modal-text">Are you sure want to delete this link? This can't be undone.</p>
    <div class="text-right">
      <label class="paper-btn" for="delete-modal">Cancel</label>
      <label class="paper-btn btn-danger" for="delete-modal" on:click={onClickDelete} on:keydown>
        Ok
      </label>
    </div>
  </div>
</div>
<div class="text-center">
  <div class="margin-top text-danger">{deleteError}</div>
</div>

<!-- copy modal -->
<input class="modal-state" id="copy-modal" type="checkbox" bind:checked={copyOpen} />
<div class="modal">
  <label class="modal-bg" for="copy-modal" />
  <div class="modal-body">
    <label class="btn-close" for="copy-modal">X</label>
    <h4 class="modal-title">Copied!</h4>
    <p class="modal-text">{copyText}</p>
    <div class="text-right">
      <label class="paper-btn" for="copy-modal"> Ok </label>
    </div>
  </div>
</div>
