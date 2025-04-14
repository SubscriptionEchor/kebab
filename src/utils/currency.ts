/**
 * Format a price with the currency symbol from localStorage
 */
export function formatPrice(amount: number): string {
  try {
    // Get currency config from localStorage
    const config = localStorage.getItem('kebab_currency_config');
    const currencySymbol = config ? JSON.parse(config).currencySymbol : '$';

    // Format the number with 2 decimal places
    const formattedAmount = amount?.toFixed(2);

    // Return formatted price with currency symbol
    return `${currencySymbol}${formattedAmount}`;
  } catch (error) {
    console.error('Error formatting price:', error);
    // Fallback to dollar symbol if there's an error
    return `$${amount?.toFixed(2)}`;
  }
}

/**
 * Parse a price string into a number
 */
export function parsePrice(priceString: string): number {
  try {
    // Remove currency symbol and any whitespace
    const cleanString = priceString.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleanString);
  } catch (error) {
    console.error('Error parsing price:', error);
    return 0;
  }
}

/**
 * Format a price range with currency symbol
 */
export function formatPriceRange(min: number, max: number): string {
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(price: number, discountPercentage: number): number {
  return price * (discountPercentage / 100);
}

/**
 * Format price with discount
 */
export function formatPriceWithDiscount(price: number, discountPercentage: number): string {
  const discountedPrice = price - calculateDiscount(price, discountPercentage);
  return formatPrice(discountedPrice);
}
/**
 * Get currency symbol from localStorage
 */
export function getCurrencySymbol(): string {
  try {
    const config = localStorage.getItem('kebab_currency_config');
    return config ? JSON.parse(config).currencySymbol : '$';
  } catch (error) {
    console.error('Error getting currency symbol:', error);
    return '$';
  }
}