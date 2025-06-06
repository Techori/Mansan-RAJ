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

  // Format the item for billing
  return {
    id: item.id,
    itemId: item.itemId,
    name: item.name,
    companyId: item.companyId,
    company: item.company,
    godownId: item.godownId,
    godown: item.godown || 'Not assigned',
    unitPrice: item.unitPrice,
    quantity: item.quantity || 1, // Use provided quantity or default to 1
    gstPercentage: hasGst ? item.gstPercentage : undefined, // Keep undefined for non-GST items
    gstAmount: gstAmount,
    totalPrice: item.unitPrice + gstAmount,
    totalAmount: item.totalAmount || (item.unitPrice + gstAmount),
    mrp: item.mrp,
    hsnCode: item.hsn,
    type: item.type,
    salesUnit: item.salesUnit || 'Piece',
    availableQuantity: totalPieces,
    companyName: item.companyName || (item.company && item.company.name) || '',
  };
}; 