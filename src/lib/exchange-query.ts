export function getExchangeQueryKey(baseCurrency: string) {
  return ['exchange', baseCurrency] as const;
}
