/**
 * Formats a number as Indian currency (INR)
 * @param amount - The amount to format
 * @returns Formatted string with ₹ symbol and thousands separators
 */
export const formatCurrency = (amount: number): string => {
  // Handle undefined, null, or NaN
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }

  // Convert to 2 decimal places and get parts
  const [rupees, paise = '00'] = amount.toFixed(2).split('.');

  // Format rupees with Indian thousand separators (e.g., 1,23,456)
  const formattedRupees = rupees.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Combine with ₹ symbol
  return `₹${formattedRupees}.${paise}`;
}; 