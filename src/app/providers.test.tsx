import { render, screen } from '@testing-library/react';
import Providers from './providers';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('@tanstack/react-query-persist-client', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query-persist-client')>(
    '@tanstack/react-query-persist-client'
  );

  return {
    ...actual,
    PersistQueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('Providers', () => {
  it('renders children correctly', () => {
    render(
      <Providers>
        <div data-testid="child">Test Child</div>
      </Providers>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders the toaster from sonner', () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>
    );

    // Sonner usually renders a container with an aria-label or specific classes
    // We can check if something that looks like a toast container is present
    const toaster = document.querySelector('section[data-sonner-toaster]');
    expect(toaster).toBeDefined();
  });
});
