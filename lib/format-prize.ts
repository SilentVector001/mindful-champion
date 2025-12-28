/**
 * Format prize money for display
 * @param amount - Prize amount in dollars
 * @returns Formatted string with proper formatting (e.g., "$100,000" or "$1.5M")
 */
export function formatPrizeMoney(amount: number): string {
  if (amount >= 1000000) {
    // Format millions with one decimal place
    const millions = amount / 1000000;
    return `$${millions.toFixed(1)}M`;
  } else if (amount >= 10000) {
    // Format thousands with "K" suffix
    const thousands = Math.floor(amount / 1000);
    return `$${thousands}K`;
  } else if (amount >= 1000) {
    // Format with commas for amounts >= 1000
    return `$${amount.toLocaleString('en-US')}`;
  } else {
    // Format small amounts directly
    return `$${amount}`;
  }
}

/**
 * Format prize money with full details (always show cents if present)
 * @param amount - Prize amount in dollars
 * @returns Formatted string with commas and cents (e.g., "$100,000.00")
 */
export function formatPrizeMoneyDetailed(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Parse formatted prize string back to number
 * @param prizeString - Formatted prize string (e.g., "$100K" or "$1.5M")
 * @returns Numeric amount
 */
export function parsePrizeMoney(prizeString: string): number {
  // Remove $ and commas
  const cleaned = prizeString.replace(/[$,]/g, '');
  
  // Handle K suffix
  if (cleaned.endsWith('K')) {
    return parseFloat(cleaned.slice(0, -1)) * 1000;
  }
  
  // Handle M suffix
  if (cleaned.endsWith('M')) {
    return parseFloat(cleaned.slice(0, -1)) * 1000000;
  }
  
  return parseFloat(cleaned);
}
