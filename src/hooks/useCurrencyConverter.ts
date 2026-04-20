'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExchangeRatesAction } from '../app/actions/exchange-actions';
import type { CurrencyRate } from '../domain/entities/exchange-snapshot';
import { convertCurrency } from '../domain/use-cases/convert-currency';
import {
  type ExchangeRate,
  type ExchangeResponse,
} from '../infrastructure/contracts/exchange-api';
import { getExchangeQueryKey } from '../lib/exchange-query';
import type { MarketStatus } from '../lib/market-status';

interface UseCurrencyConverterResult {
  amount: number;
  setAmount: (value: number) => void;
  from: string;
  setFrom: (value: string) => void;
  to: string;
  setTo: (value: string) => void;
  result: number;
  exchangeRate: number;
  inverseRate: number;
  currencies: ExchangeRate[];
  marketStatus: MarketStatus;
  handleSwap: () => void;
  lastUpdated?: string;
  baseCurrency?: string;
}

/**
 * Client-side orchestration hook.
 * UI state stays in React while business rules come from the domain layer.
 */
export function useCurrencyConverter(): UseCurrencyConverterResult {
  const [amount, setAmount] = useState<number>(1);
  const [from, setFrom] = useState<string>('USD');
  const [to, setTo] = useState<string>('EUR');

  const { data, status, error } = useQuery<ExchangeResponse>({
    queryKey: getExchangeQueryKey(from),
    queryFn: () => getExchangeRatesAction(from),
    staleTime: 1000 * 60 * 5,
  });

  const marketStatus = useMemo<MarketStatus>(() => {
    if (status === 'pending') {
      return { state: 'loading' };
    }

    if (status === 'error') {
      return {
        state: 'error',
        message: error instanceof Error ? error.message : 'Market connection lost',
      };
    }

    return { state: 'ready' };
  }, [error, status]);

  const currencies = useMemo<ExchangeRate[]>(() => {
    return data?.rates ?? [];
  }, [data?.rates]);

  const conversionQuote = useMemo(() => {
    return convertCurrency({
      amount,
      targetCurrency: to,
      rates: currencies as readonly CurrencyRate[],
    });
  }, [amount, currencies, to]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  return {
    amount,
    setAmount,
    from,
    setFrom,
    to,
    setTo,
    result: conversionQuote.convertedAmount,
    exchangeRate: conversionQuote.exchangeRate,
    inverseRate: conversionQuote.inverseRate,
    currencies,
    marketStatus,
    handleSwap,
    lastUpdated: data?.timestamp,
    baseCurrency: data?.base,
  };
}
