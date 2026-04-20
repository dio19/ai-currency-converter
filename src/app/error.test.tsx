import { render, screen, fireEvent } from '@testing-library/react';
import GlobalError from './error';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { logger } from '../lib/logger';

// Mock logger
vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('GlobalError', () => {
  const mockReset = vi.fn();
  const mockError = Object.assign(new Error('Test Crash'), {
    digest: 'test-digest-123',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders error message and logs it', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(logger.error).toHaveBeenCalledWith(
      'CLIENT_SIDE_UNHANDLED_EXCEPTION',
      { digest: 'test-digest-123' },
      mockError
    );
  });

  it('calls reset when "Try again" button is clicked', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    const retryButton = screen.getByText('Try again');
    fireEvent.click(retryButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
