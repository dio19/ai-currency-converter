import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ConversionResult from './ConversionResult';

const meta: Meta<typeof ConversionResult> = {
  title: 'Components/ConversionResult',
  component: ConversionResult,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-4xl mx-auto p-12 bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConversionResult>;

const baseArgs = {
  amount: 100,
  from: 'USD',
  fromName: 'US Dollar',
  to: 'EUR',
  toName: 'Euro',
  result: 85,
  exchangeRate: 0.85,
  inverseRate: 1 / 0.85,
  marketStatus: { state: 'ready' as const },
};

export const Loading: Story = {
  args: {
    ...baseArgs,
    marketStatus: { state: 'loading' as const },
  },
};

export const Default: Story = {
  args: baseArgs,
};

export const Error: Story = {
  args: {
    ...baseArgs,
    marketStatus: { state: 'error' as const, message: 'Market connection lost' },
  },
};
