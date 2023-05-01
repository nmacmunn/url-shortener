<script lang="ts">
  import { page } from "$app/stores";
  import { env } from "$env/dynamic/public";
  import "papercss";
</script>

<div class="container">
  <div class="text-center">
    <h1>{env.PUBLIC_APP_NAME}</h1>
  </div>
  <div class="paper">
    <slot />
  </div>
  {#if $page.url.pathname !== "/"}
    <div class="text-center">
      <p>
        <a href="/"> home </a>
      </p>
    </div>
  {/if}
</div>
