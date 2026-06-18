import { render } from 'solid-js/web';
import { QueryClientProvider } from '@tanstack/solid-query';
import { Toaster } from 'solid-sonner';
import './styles.css';
import { App } from './App';
import { createQueryClient } from '@/app/query-client';

const queryClient = createQueryClient();

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  ),
  root,
);
