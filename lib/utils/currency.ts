/**
 * Currency formatting utilities for consistent display across the app
 */

export function formatPrizeMoney(amount: number | null | undefined): string {
  if (!amount && amount !== 0) return '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatEntryFee(amount: number | null | undefined): string {
  if (!amount && amount !== 0) return 'Free';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrency(amount: number | null | undefined, options?: Intl.NumberFormatOptions): string {
  if (!amount && amount !== 0) return '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    ...options,
  }).format(amount);
}

/**
 * Format large numbers with K/M/B suffixes
 * Example: 1,500,000 -> "$1.5M"
 */
export function formatCompactCurrency(amount: number | null | undefined): string {
  if (!amount && amount !== 0) return '$0';
  
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  
  return formatPrizeMoney(amount);
}
