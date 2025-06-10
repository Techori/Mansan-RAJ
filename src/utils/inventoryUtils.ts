export const formatInventoryItemForBilling = (item: any) => {
  // Parse stock quantity with null checks
  let totalPieces = item.stockQuantityNumeric || 0;
  
  if (item.stockQuantity && typeof item.stockQuantity === 'string') {
    const stockQuantityMatch = item.stockQuantity.match(/(\d+)\s*box\s*(\d+\.?\d*)\s*pcs/);
    if (stockQuantityMatch) {
      totalPieces = (parseInt(stockQuantityMatch[1]) * 16) + parseFloat(stockQuantityMatch[2]);
    }
  }

  // Handle gstPercentage properly for non-GST items (keep it undefined)
  const hasGst = item.gstPercentage !== undefined && item.gstPercentage > 0;
  
  // Calculate GST amount only if GST is applicable
  const gstAmount = hasGst 
    ? (item.unitPrice * item.gstPercentage) / 100
    : 0;

  // Calculate MRP if not provided
  const mrp = item.mrp.includes('/')
    ? item.mrp.split('/')[0]
    : item.mrp;
  // Format the item for billing

  return {
    name: item.name,
    companyName: item.companyName,
    godown: item.godown || 'Not assigned',
    unitPrice: item.unitPrice,
    quantity: item.quantity || 1, // Use provided quantity or default to 1
    gstPercentage: hasGst ? item.gstPercentage : undefined, // Keep undefined for non-GST items
    gstAmount: gstAmount,
    totalPrice: item.unitPrice + gstAmount,
    totalAmount: item.totalAmount || (item.unitPrice + gstAmount),
    mrp: Number(mrp) || 0, // Ensure MRP is a number
    hsnCode: item.hsnCode,
    salesUnit: item.salesUnit || 'Piece',
    availableQuantity: totalPieces,
    priceLevelList: item.priceLevelList || [],
    allUnits : item.allUnits
  };
}; 