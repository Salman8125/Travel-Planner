<script lang="ts">
  import { LogOut, Moon, Sun } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth.svelte';
  import { ui } from '$lib/stores/ui.svelte';
  import PageHeader from '$lib/components/common/PageHeader.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';

  function logout() {
    auth.logout();
    goto('/login');
  }
</script>

<svelte:head><title>Settings · PennyPilot</title></svelte:head>

<div class="mx-auto max-w-xl space-y-6">
  <PageHeader title="Settings" />

  <Card class="divide-y p-0">
    <div class="p-6">
      <p class="text-sm text-muted-foreground">Signed in as</p>
      <p class="font-medium">{auth.user?.email}</p>
      <div class="mt-2 flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Role</span>
        <Badge variant={auth.isAdmin ? 'default' : 'secondary'}>{auth.user?.role}</Badge>
      </div>
    </div>

    <div class="flex items-center justify-between p-6">
      <div>
        <p class="text-sm font-medium">Appearance</p>
        <p class="text-xs text-muted-foreground capitalize">{ui.theme} mode</p>
      </div>
      <Button variant="outline" size="sm" onclick={() => ui.toggleTheme()}>
        {#if ui.theme === 'dark'}<Sun class="h-4 w-4" />{:else}<Moon class="h-4 w-4" />{/if}
        Toggle theme
      </Button>
    </div>

    <div class="p-6">
      <Button variant="destructive" onclick={logout}>
        <LogOut class="h-4 w-4" /> Log out
      </Button>
    </div>
  </Card>
</div>
