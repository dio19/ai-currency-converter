import { z } from 'zod';

const CurrencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Currency code must be a 3-letter ISO code.');

export const ExternalRatesSchema = z.object({
  date: z.string().min(1),
  base: CurrencyCodeSchema,
  rates: z.record(CurrencyCodeSchema, z.number().finite().nonnegative()),
});

export const ExternalCurrenciesSchema = z.record(
  CurrencyCodeSchema,
  z.object({
    name: z.string().min(1),
    symbol: z.string(),
  })
);

export type ExternalRates = z.infer<typeof ExternalRatesSchema>;
export type ExternalCurrencies = z.infer<typeof ExternalCurrenciesSchema>;
