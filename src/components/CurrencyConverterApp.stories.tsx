import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { motion } from 'motion/react';
import CurrencyConverterApp from './CurrencyConverterApp';
import AnimatedCard from './AnimatedCard';
import ConverterForm from './ConverterForm';
import ConversionResult from './ConversionResult';

type MockRate = {
  code: string;
  name: string;
  symbol: string;
  rate: number;
};

type RatesByBase = Record<string, MockRate[]>;

const ratesByBase: RatesByBase = {
  USD: [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: 'EUR', rate: 0.85 },
    { code: 'TRY', name: 'Turkish Lira', symbol: 'TRY', rate: 40.91 },
    { code: 'GBP', name: 'British Pound', symbol: 'GBP', rate: 0.74 },
  ],
  EUR: [
    { code: 'EUR', name: 'Euro', symbol: 'EUR', rate: 1 },
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.18 },
    { code: 'TRY', name: 'Turkish Lira', symbol: 'TRY', rate: 52.7417 },
    { code: 'GBP', name: 'British Pound', symbol: 'GBP', rate: 0.87 },
  ],
  TRY: [
    { code: 'TRY', name: 'Turkish Lira', symbol: 'TRY', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: 'EUR', rate: 0.01896 },
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.02378 },
    { code: 'GBP', name: 'British Pound', symbol: 'GBP', rate: 0.0165 },
  ],
  GBP: [
    { code: 'GBP', name: 'British Pound', symbol: 'GBP', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: 'EUR', rate: 1.15 },
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.35 },
    { code: 'TRY', name: 'Turkish Lira', symbol: 'TRY', rate: 60.4 },
  ],
};

interface StoryHarnessProps {
  initialAmount?: number;
  initialFrom?: string;
  initialTo?: string;
  marketStatusOverride?: 'ready' | 'error';
  marketErrorMessage?: string;
}

function StoryHarness({
  initialAmount = 1,
  initialFrom = 'USD',
  initialTo = 'EUR',
  marketStatusOverride = 'ready',
  marketErrorMessage = 'Market connection lost',
}: StoryHarnessProps) {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [from, setFrom] = useState<string>(initialFrom);
  const [to, setTo] = useState<string>(initialTo);

  const currencies = useMemo(() => {
    return ratesByBase[from] ?? ratesByBase.USD;
  }, [from]);

  const fromCurrencyData = currencies.find((currency) => currency.code === from);
  const toCurrencyData = currencies.find((currency) => currency.code === to) ?? currencies[0];
  const safeTo = toCurrencyData?.code ?? currencies[0]?.code ?? 'EUR';

  const result = amount > 0 && toCurrencyData ? amount * toCurrencyData.rate : 0;
  const exchangeRate = toCurrencyData?.rate ?? 0;
  const inverseRate = exchangeRate > 0 ? 1 / exchangeRate : 0;
  const marketStatus =
    marketStatusOverride === 'error'
      ? { state: 'error' as const, message: marketErrorMessage }
      : { state: 'ready' as const };

  const handleSwap = () => {
    setFrom(safeTo);
    setTo(from);
  };

  return (
    <div className="bg-gray-100 min-h-[600px]">
      <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#2e3333]">
        <nav className="h-12 bg-[#0c102a] flex items-center px-4 md:px-20 text-white font-bold text-sm">
          Currency Converter
        </nav>

        <div className="bg-[#5f37ff] h-64 flex flex-col items-center justify-center text-white px-4 relative">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl font-bold mb-12 text-center max-w-4xl tracking-tight"
          >
            {amount.toFixed(amount % 1 === 0 ? 0 : 2)} {from} to {safeTo} - Convert{' '}
            {fromCurrencyData?.name || from} to {toCurrencyData?.name || safeTo}
          </motion.h1>
        </div>

        <div className="max-w-6xl mx-auto -mt-24 px-4 relative z-10 pb-20">
          <AnimatedCard triggerKey={`${from}-${safeTo}`}>
            <ConverterForm
              amount={amount}
              setAmount={setAmount}
              from={from}
              setFrom={setFrom}
              to={safeTo}
              setTo={setTo}
              currencies={currencies}
              handleSwap={handleSwap}
            />

            <ConversionResult
              amount={amount}
              from={from}
              fromName={fromCurrencyData?.name || from}
              to={safeTo}
              toName={toCurrencyData?.name || safeTo}
              result={result}
              exchangeRate={exchangeRate}
              inverseRate={inverseRate}
              marketStatus={marketStatus}
            />

            <div className="mt-10 pt-4 border-t border-gray-50 flex justify-end">
              <p className="text-[11px] text-gray-400 font-medium italic underline decoration-gray-200">
                {fromCurrencyData?.name || from} to {toCurrencyData?.name || safeTo} conversion -
                Last updated Apr 15, 2026, 9:00 PM UTC
              </p>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof CurrencyConverterApp> = {
  title: 'Applications/CurrencyConverter',
  component: CurrencyConverterApp,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'responsive',
    },
    a11y: {
      element: '#storybook-root',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CurrencyConverterApp>;

export const Default: Story = {
  render: () => <StoryHarness initialAmount={100} initialFrom="EUR" initialTo="TRY" />,
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
  },
};

export const Mobile: Story = {
  render: () => <StoryHarness initialAmount={1} initialFrom="USD" initialTo="EUR" />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const ErrorState: Story = {
  render: () => (
    <StoryHarness
      initialAmount={100}
      initialFrom="EUR"
      initialTo="TRY"
      marketStatusOverride="error"
      marketErrorMessage="Market connection lost"
    />
  ),
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
  },
};
