<script lang="typescript">
  import { page } from "$app/stores";
</script>

<div class="text-center">
  <h2>:(</h2>
  <p>{$page.error?.message}</p>
</div>
