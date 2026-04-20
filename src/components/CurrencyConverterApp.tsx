'use client';

import React from 'react';
import { useCurrencyConverter } from '../hooks/useCurrencyConverter';
import { motion } from 'motion/react';
import AnimatedCard from './AnimatedCard';
import ConverterForm from './ConverterForm';
import ConversionResult from './ConversionResult';

/**
 * Main Application Component (Modular Refactored)
 * Orchestrates pure components using the useCurrencyConverter hook.
 */
export default function CurrencyConverterApp() {
  const {
    amount,
    setAmount,
    from,
    setFrom,
    to,
    setTo,
    result,
    exchangeRate,
    inverseRate,
    currencies,
    marketStatus,
    handleSwap,
    lastUpdated,
  } = useCurrencyConverter();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const fromCurrencyData = currencies.find((c) => c.code === from);
  const toCurrencyData = currencies.find((c) => c.code === to);

  const formattedDate = React.useMemo(() => {
    if (!lastUpdated) return 'recently';
    return new Date(lastUpdated).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }) + ' UTC';
  }, [lastUpdated]);

  return (
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
          {amount.toFixed(amount % 1 === 0 ? 0 : 2)} {from} to {to} — Convert{' '}
          {fromCurrencyData?.name || from} to {toCurrencyData?.name || to}
        </motion.h1>
      </div>

      <div className="max-w-6xl mx-auto -mt-24 px-4 relative z-10 pb-20">
        <AnimatedCard triggerKey={`${from}-${to}`}>
          <ConverterForm
            amount={amount}
            setAmount={setAmount}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            currencies={currencies}
            handleSwap={handleSwap}
          />

          <ConversionResult
            amount={amount}
            from={from}
            fromName={fromCurrencyData?.name || from}
            to={to}
            toName={toCurrencyData?.name || to}
            result={result}
            exchangeRate={exchangeRate}
            inverseRate={inverseRate}
            marketStatus={marketStatus}
          />

          <div className="mt-10 pt-4 border-t border-gray-50 flex justify-end">
            <p className="text-[11px] text-gray-400 font-medium italic underline decoration-gray-200">
              {fromCurrencyData?.name} to {toCurrencyData?.name} conversion — Last updated{' '}
              {mounted ? formattedDate : '...'}
            </p>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}
