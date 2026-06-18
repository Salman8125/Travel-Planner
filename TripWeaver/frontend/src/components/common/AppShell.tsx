import type { JSX } from 'solid-js';
import { NavBar } from './NavBar';

export function AppShell(props: { children: JSX.Element }) {
  return (
    <div class="min-h-screen">
      <NavBar />
      <main class="mx-auto max-w-6xl px-4 py-6">{props.children}</main>
    </div>
  );
}
