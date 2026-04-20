'use client';

import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  rate: number;
}

interface ConverterFormProps {
  amount: number;
  setAmount: (val: number) => void;
  from: string;
  setFrom: (val: string) => void;
  to: string;
  setTo: (val: string) => void;
  currencies: Currency[];
  handleSwap: () => void;
}

export default function ConverterForm({
  amount,
  setAmount,
  from,
  setFrom,
  to,
  setTo,
  currencies,
  handleSwap
}: ConverterFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-10">
      <div className="md:col-span-3 space-y-2">
        <label htmlFor="amount-input" className="block text-sm font-bold text-[#5c667b]">Amount</label>
        <input
          id="amount-input"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
          min="0"
          inputMode="decimal"
          aria-describedby="amount-helper"
          className="w-full h-12 px-4 bg-white border border-gray-200 rounded-md font-bold focus:ring-2 focus:ring-[#5f37ff] focus:border-transparent outline-none transition-all shadow-sm"
        />
        <p id="amount-helper" className="text-xs text-[#5c667b]">
          Enter a non-negative amount to convert.
        </p>
      </div>

      <div className="md:col-span-4 space-y-2">
        <label htmlFor="from-currency" className="block text-sm font-bold text-[#5c667b]">From</label>
        <select
          id="from-currency"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full h-12 px-4 bg-white border border-gray-200 rounded-md font-semibold focus:ring-2 focus:ring-[#5f37ff] outline-none cursor-pointer shadow-sm appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235c667b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
        >
          {currencies.map(c => (
            <option key={`from-${c.code}`} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-1 flex justify-center md:pt-8">
        <button 
          onClick={handleSwap}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-[#5f37ff] hover:bg-[#e1e1ff] transition-all active:scale-95 shadow-sm"
          aria-label="Swap currencies"
        >
          <ArrowLeftRight size={18} />
        </button>
      </div>

      <div className="md:col-span-4 space-y-2">
        <label htmlFor="to-currency" className="block text-sm font-bold text-[#5c667b]">To</label>
        <select
          id="to-currency"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full h-12 px-4 bg-white border border-gray-200 rounded-md font-semibold focus:ring-2 focus:ring-[#5f37ff] outline-none cursor-pointer shadow-sm appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235c667b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
        >
          {currencies.map(c => (
            <option key={`to-${c.code}`} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
