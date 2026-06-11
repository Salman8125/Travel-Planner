<script lang="ts">
  import { budgetsQuery } from '$lib/features/budgets/queries';

  const q = budgetsQuery(() => ({ page: 1, pageSize: 12, ordering: '-created_at' }));
</script>

{#if q.isPending}
  <span>loading</span>
{:else if q.isError}
  <span>error</span>
{:else if q.data}
  <ul>
    {#each q.data.items as budget (budget.id)}
      <li>{budget.name}</li>
    {/each}
  </ul>
{/if}
