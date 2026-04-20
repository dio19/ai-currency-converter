'use client';

import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';
import { motion, AnimatePresence } from 'motion/react';
import type { MarketStatus } from '../lib/market-status';

interface ConversionResultProps {
  amount: number;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  result: number;
  exchangeRate: number;
  inverseRate: number;
  marketStatus: MarketStatus;
}

export default function ConversionResult({
  amount,
  from,
  fromName,
  to,
  toName,
  result,
  exchangeRate,
  inverseRate,
  marketStatus,
}: ConversionResultProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <AnimatePresence mode="wait">
        {marketStatus.state === 'loading' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 text-[#5f37ff] py-4"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="w-5 h-5 border-2 border-[#5f37ff] border-t-transparent rounded-full animate-spin" />
            <span className="font-bold">Syncing market rates...</span>
          </motion.div>
        ) : marketStatus.state === 'error' ? (
          <div
            className="flex items-center gap-3 text-red-500 py-4 font-bold"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle size={20} />
            <span>{marketStatus.message || 'Market connection lost'}</span>
          </div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
            aria-live="polite"
          >
            <p className="text-xl md:text-2xl font-bold text-[#2e3333]">
              {amount.toFixed(2)} {fromName} =
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0c102a] pb-2">
              {formatCurrency(result, to)} {toName}
            </h2>
            <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-tight">
              1 {from} = {exchangeRate.toFixed(6)} {to}
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">
              1 {to} = {inverseRate.toFixed(6)} {from}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#e1e1ff] p-6 rounded-xl border border-[#d1d1ff]">
        <div className="flex gap-3">
          <Info size={16} className="text-[#5f37ff] shrink-0 mt-0.5" />
          <p className="text-[13px] text-gray-500 leading-relaxed">
            We use the mid-market rate for our Converter. This is for informational purposes only.
            You won&apos;t receive this rate when sending money.
          </p>
        </div>
      </div>
    </div>
  );
}
