import { render, screen } from '@testing-library/react';
import Loading from './loading';
import { describe, expect, it } from 'vitest';
import React from 'react';

describe('Route Loading', () => {
  it('renders a route-level loading shell', () => {
    render(<Loading />);

    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Currency Converter')).toBeInTheDocument();
  });
});
