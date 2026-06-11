<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Wallet, LogOut, ShieldCheck, User as UserIcon, Settings } from '@lucide/svelte';
  import { auth } from '$lib/stores/auth.svelte';
  import { cn } from '$lib/utils/cn';
  import Button from '$lib/components/ui/Button.svelte';
  import DropdownMenu from '$lib/components/ui/DropdownMenu.svelte';
  import ThemeToggle from './ThemeToggle.svelte';

  const links = $derived(
    [
      { href: '/budgets', label: 'Budgets', show: true },
      { href: '/admin/budgets', label: 'Admin', show: auth.isAdmin }
    ].filter((link) => link.show)
  );

  function isActive(href: string): boolean {
    const path = $page.url.pathname;
    return path === href || path.startsWith(href + '/');
  }

  function logout() {
    auth.logout();
    goto('/login');
  }
</script>

<header class="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
  <div class="container flex h-16 items-center justify-between gap-4">
    <div class="flex items-center gap-6">
      <a href="/budgets" class="flex items-center gap-2 text-lg font-bold">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet class="h-5 w-5" />
        </span>
        PennyPilot
      </a>
      <nav class="flex items-center gap-1">
        {#each links as link (link.href)}
          <a
            href={link.href}
            class={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive(link.href)
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {link.label}
          </a>
        {/each}
      </nav>
    </div>

    <div class="flex items-center gap-2">
      <ThemeToggle />
      <DropdownMenu>
        {#snippet trigger({ toggle })}
          <Button variant="outline" size="sm" onclick={toggle}>
            <UserIcon class="h-4 w-4" />
            <span class="hidden max-w-[12rem] truncate sm:inline">{auth.user?.email ?? 'Account'}</span>
          </Button>
        {/snippet}
        {#snippet children({ close })}
          <div class="px-2 py-1.5 text-xs text-muted-foreground">{auth.user?.email}</div>
          {#if auth.isAdmin}
            <div class="px-2 pb-1.5">
              <span class="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <ShieldCheck class="h-3 w-3" /> Administrator
              </span>
            </div>
          {/if}
          <div class="my-1 h-px bg-border"></div>
          <a
            href="/settings"
            onclick={close}
            class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
          >
            <Settings class="h-4 w-4" /> Settings
          </a>
          <button
            type="button"
            onclick={() => {
              close();
              logout();
            }}
            class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-destructive hover:bg-accent"
          >
            <LogOut class="h-4 w-4" /> Log out
          </button>
        {/snippet}
      </DropdownMenu>
    </div>
  </div>
</header>
