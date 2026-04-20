import { render, screen } from '@testing-library/react';
import RootLayout from './layout';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock Inter font
vi.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-mock',
  }),
}));

// Mock Providers
vi.mock('./providers', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="providers">{children}</div>,
}));

describe('RootLayout', () => {
  it('renders children within providers', () => {
    // In JSDOM, rendering html/body usually results in them being nested inside the existing body,
    // which is fine for a simple existence check.
    render(
      <RootLayout>
        <div data-testid="layout-child">Child Content</div>
      </RootLayout>
    );
    
    expect(screen.getByTestId('providers')).toBeInTheDocument();
    expect(screen.getByTestId('layout-child')).toBeInTheDocument();
  });
});
