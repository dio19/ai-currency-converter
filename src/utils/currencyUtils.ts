/**
 * Format a number as currency using Intl.NumberFormat.
 * @param amount The value to format.
 * @param currencyCode The ISO currency code.
 * @returns Formatted currency string.
 */
export const formatCurrency = (amount: number, _currencyCode: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  } catch {
    return amount.toFixed(6);
  }
};
