import { z } from 'zod';

export interface ExchangeRate {
  code: string;
  rate: number;
  name: string;
  symbol: string;
}

export interface ExchangeResponse {
  base: string;
  timestamp: string;
  rates: ExchangeRate[];
}

export const CurrencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Currency code must be a 3-letter ISO code.');

export const ExchangeRateSchema = z.object({
  code: CurrencyCodeSchema,
  rate: z.number().finite().nonnegative(),
  name: z.string().min(1),
  symbol: z.string(),
});

export const ExchangeResponseSchema = z.object({
  base: CurrencyCodeSchema,
  timestamp: z.string().min(1),
  rates: z.array(ExchangeRateSchema),
});

export const ExchangeQuerySchema = z.object({
  base: CurrencyCodeSchema.optional().default('USD'),
});

export const ProblemDetailsSchema = z
  .object({
    type: z.string().min(1),
    title: z.string().min(1),
    status: z.number().int().positive(),
    detail: z.string().min(1),
    instance: z.string().optional(),
    code: z.string().min(1),
    severity: z.enum(['error', 'warning', 'info']),
  })
  .catchall(z.unknown());

export type ExchangeQuery = z.infer<typeof ExchangeQuerySchema>;
export type ProblemDetailsResponse = z.infer<typeof ProblemDetailsSchema>;
