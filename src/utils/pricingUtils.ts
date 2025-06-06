
/**
 * Utility functions for MRP-based pricing calculations
 */

/**
 * Calculate GST amount based on exclusive cost and GST percentage
 */
export const calculateGstAmount = (exclusiveCost: number, gstPercentage: number): number => {
  return (exclusiveCost * gstPercentage) / 100;
};

/**
 * Calculate MRP based on exclusive cost and GST percentage
 */
export const calculateMRP = (exclusiveCost: number, gstPercentage: number): number => {
  return exclusiveCost + calculateGstAmount(exclusiveCost, gstPercentage);
};

/**
 * Calculate exclusive cost from MRP and GST percentage
 */
export const calculateExclusiveCost = (mrp: number, gstPercentage: number): number => {
  return mrp / (1 + gstPercentage / 100);
};

/**
 * Apply discount on exclusive cost
 * @param exclusiveCost The exclusive cost without GST
 * @param discount The discount amount or percentage
 * @param isPercentage Whether the discount is a percentage or absolute value
 */
export const applyDiscount = (
  exclusiveCost: number, 
  discount: number, 
  isPercentage: boolean = false
): number => {
  if (isPercentage) {
    // Ensure discount percentage is not greater than 100%
    const validDiscount = Math.min(discount, 100);
    return exclusiveCost * (1 - validDiscount / 100);
  } else {
    // Ensure discount amount is not greater than exclusive cost
    const validDiscount = Math.min(discount, exclusiveCost);
    return exclusiveCost - validDiscount;
  }
};

/**
 * Calculate final price after GST and discount
 */
export const calculateFinalPrice = (
  exclusiveCost: number,
  gstPercentage: number = 0,
  discount: number = 0,
  isPercentage: boolean = false
): { 
  discountedExclusiveCost: number;
  discountAmount: number;
  gstAmount: number;
  finalPrice: number;
} => {
  // Calculate discount amount
  let discountAmount = 0;
  if (isPercentage) {
    discountAmount = exclusiveCost * (discount / 100);
  } else {
    discountAmount = Math.min(discount, exclusiveCost);
  }
  
  // Apply discount to exclusive cost
  const discountedExclusiveCost = exclusiveCost - discountAmount;
  
  // Calculate GST on discounted exclusive cost
  const gstAmount = calculateGstAmount(discountedExclusiveCost, gstPercentage);
  
  // Calculate final price
  const finalPrice = discountedExclusiveCost + gstAmount;
  
  return {
    discountedExclusiveCost,
    discountAmount,
    gstAmount,
    finalPrice
  };
};

/**
 * Validate whether items from a company are all of the same type (GST or NON-GST)
 */
export const validateCompanyItemsType = (items: { type: 'GST' | 'NON-GST' }[]): boolean => {
  if (items.length <= 1) return true;
  
  const firstType = items[0].type;
  return items.every(item => item.type === firstType);
};
