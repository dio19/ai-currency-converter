export type MarketStatus =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready' };
