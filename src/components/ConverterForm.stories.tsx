import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ConverterForm from './ConverterForm';

// Mocking Next.js navigation hooks
// Note: In a real project with @storybook/nextjs this is handled automatically.
// Since we are using Vite builder, we mock them at the component level or via decorators.
const meta: Meta<typeof ConverterForm> = {
  title: 'Components/ConverterForm',
  component: ConverterForm,
  tags: ['autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-4xl mx-auto p-12 bg-white shadow-sm rounded-lg mt-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConverterForm>;

const mockCurrencies = {
  USD: { name: 'United States Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
};

const mockCurrencyList = Object.entries(mockCurrencies).map(([code, currency], index) => ({
  code,
  name: currency.name,
  symbol: currency.symbol,
  rate: index + 1,
}));

export const Default: Story = {
  args: {
    amount: 100,
    from: 'USD',
    to: 'EUR',
    setAmount: () => undefined,
    setFrom: () => undefined,
    setTo: () => undefined,
    handleSwap: () => undefined,
    currencies: mockCurrencyList,
  },
};

export const LargeAmount: Story = {
  args: {
    amount: 1500000.5,
    from: 'GBP',
    to: 'JPY',
    setAmount: () => undefined,
    setFrom: () => undefined,
    setTo: () => undefined,
    handleSwap: () => undefined,
    currencies: mockCurrencyList,
  },
};
