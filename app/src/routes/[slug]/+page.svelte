<script lang="typescript">
  import { onMount } from "svelte";
  /**
   * This page should never render but it's existence appears to prevent
   * preload requests from counting as views
   */
  onMount(() => window.close());
</script>
