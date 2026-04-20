'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState, ReactNode } from 'react';
import { Toaster } from 'sonner';

const queryClientPersistenceMaxAge = 1000 * 60 * 60 * 24;

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  get length() {
    return 0;
  },
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: queryClientPersistenceMaxAge,
        retry: 2,
      },
    },
  });
}

function createLocalStoragePersister() {
  return createSyncStoragePersister({
    storage: typeof window === 'undefined' ? noopStorage : window.localStorage,
  });
}

/**
 * Enterprise Providers Configuration
 * Includes: TanStack Query + Cache Persistence + Global Toasts
 */
export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [localStoragePersister] = useState(createLocalStoragePersister);

  const provider = (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton theme="light" />
    </>
  );

  if (typeof window === 'undefined') {
    return <QueryClientProvider client={queryClient}>{provider}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister,
        maxAge: queryClientPersistenceMaxAge,
      }}
    >
      {provider}
    </PersistQueryClientProvider>
  );
}
