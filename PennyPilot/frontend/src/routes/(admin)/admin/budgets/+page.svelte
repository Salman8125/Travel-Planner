<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import PageHeader from '$lib/components/common/PageHeader.svelte';
  import Skeleton from '$lib/components/ui/Skeleton.svelte';
  import ErrorState from '$lib/components/common/ErrorState.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';
  import BudgetFilters from '$lib/features/budgets/components/BudgetFilters.svelte';
  import BudgetList from '$lib/features/budgets/components/BudgetList.svelte';
  import { budgetsQuery } from '$lib/features/budgets/queries';

  const PAGE_SIZE = 12;

  const current = $derived.by(() => {
    const sp = $page.url.searchParams;
    return {
      status: sp.get('status') ?? '',
      period: sp.get('period') ?? '',
      currency: sp.get('currency') ?? '',
      ordering: sp.get('ordering') ?? '-created_at',
      page: Math.max(1, Number(sp.get('page') ?? '1'))
    };
  });

  const hasFilters = $derived(!!(current.status || current.period || current.currency));

  const q = budgetsQuery(() => ({
    page: current.page,
    pageSize: PAGE_SIZE,
    ordering: current.ordering,
    status: current.status || undefined,
    period: current.period || undefined,
    currency: current.currency || undefined
  }));

  function updateUrl(patch: Record<string, string | number>) {
    const sp = new URLSearchParams($page.url.searchParams);
    for (const [key, val] of Object.entries(patch)) {
      if (val === '' || val === undefined || val === null) sp.delete(key);
      else sp.set(key, String(val));
    }
    goto(`?${sp.toString()}`, { keepFocus: true, noScroll: true });
  }
</script>

<svelte:head><title>Admin · Budgets · PennyPilot</title></svelte:head>

<div class="space-y-6">
  <PageHeader
    title="All budgets"
    description="Every budget in the system. Read-only oversight."
  />

  <BudgetFilters
    status={current.status}
    period={current.period}
    currency={current.currency}
    ordering={current.ordering}
    onChange={(patch) => updateUrl({ ...patch, page: 1 })}
  />

  {#if q.isPending}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each Array.from({ length: 6 }) as _, i (i)}
        <Skeleton class="h-36 w-full" />
      {/each}
    </div>
  {:else if q.isError}
    <ErrorState error={q.error} onRetry={() => q.refetch()} />
  {:else if q.data}
    <p class="text-sm text-muted-foreground">{q.data.meta.total} budget(s) total</p>
    <BudgetList
      budgets={q.data.items}
      filtered={hasFilters}
      hrefBase="/admin/budgets"
      showCreate={false}
    />
    <Pagination meta={q.data.meta} onPage={(p) => updateUrl({ page: p })} />
  {/if}
</div>
