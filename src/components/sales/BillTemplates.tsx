
import React from 'react';
import { Company, Sale, SaleItem } from '../../types';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  thermalPage: {
    padding: 10,
    fontSize: 8,
    fontFamily: 'Helvetica',
    width: '3in',
  },
  section: {
    margin: 5,
  },
  header: {
    marginBottom: 10,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  billInfo: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billInfoCol: {
    flex: 1,
  },
  tableContainer: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 3,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
    paddingVertical: 5,
  },
  description: { width: '25%' },
  qty: { width: '10%', textAlign: 'center' },
  mrp: { width: '15%', textAlign: 'right' },
  discount: { width: '15%', textAlign: 'right' },
  exclCost: { width: '15%', textAlign: 'right' },
  gst: { width: '10%', textAlign: 'right' },
  total: { width: '10%', textAlign: 'right' },
  summaryContainer: {
    marginTop: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryTitle: {
    flex: 1,
    textAlign: 'right',
    marginRight: 5,
  },
  summaryValue: {
    width: '25%',
    textAlign: 'right',
  },
  grandTotal: {
    fontWeight: 'bold',
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    paddingTop: 3,
    marginTop: 5,
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 9,
  },
  companyHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
  },
  // New styles for thermal receipt format
  thermalCompanyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  thermalBillInfo: {
    marginBottom: 8,
    fontSize: 8,
    textAlign: 'center',
  },
  thermalTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
    fontWeight: 'bold',
    fontSize: 8,
  },
  thermalTableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    fontSize: 8,
  },
  thermalDescription: { width: '40%' },
  thermalQty: { width: '10%', textAlign: 'center' },
  thermalRate: { width: '25%', textAlign: 'right' },
  thermalAmount: { width: '25%', textAlign: 'right' },
  thermalHsn: { width: '15%', textAlign: 'center' },
  thermalGst: { width: '10%', textAlign: 'right' },
  thermalItemDetails: {
    fontSize: 7,
    color: '#555',
    paddingLeft: 3,
    paddingTop: 1,
  },
  thermalTaxSummary: {
    marginTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#000',
    paddingTop: 5,
  },
  thermalTaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    fontSize: 8,
  },
  // Estimate specific styles
  estimateDescription: { width: '45%' },
  estimateQty: { width: '15%', textAlign: 'center' },
  estimateRate: { width: '20%', textAlign: 'right' },
  estimateAmount: { width: '20%', textAlign: 'right' },
});

interface CompanyBillTemplateProps {
  company: Company;
  sale: Sale;
  items: SaleItem[];
}

export const CompanyBillTemplate: React.FC<CompanyBillTemplateProps> = ({ company, sale, items }) => {
  // Calculate total quantities and amounts
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalExclusiveCost = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.discountValue || 0), 0);
  const totalGst = items.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
  const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Round off calculation
  const roundedGrandTotal = Math.round(grandTotal);
  const roundOff = roundedGrandTotal - grandTotal;

  // Check if any item has GST or discount
  const hasGst = items.some(item => item.gstPercentage && item.gstPercentage > 0);
  const hasDiscount = items.some(item => item.discountValue && item.discountValue > 0);

  // Check for company type to determine template
  const isMansan = company.name === 'Mansan Laal and Sons';
  const isEstimate = company.name === 'Estimate';

  // Group items by GST rate for tax summary (needed for Mansan Laal format)
  const groupedByGstRate: Record<string, { rate: number, taxable: number, tax: number }> = {};
  if (isMansan && hasGst) {
    items.forEach(item => {
      if (item.gstPercentage) {
        const rate = item.gstPercentage.toString();
        if (!groupedByGstRate[rate]) {
          groupedByGstRate[rate] = { rate: item.gstPercentage, taxable: 0, tax: 0 };
        }
        groupedByGstRate[rate].taxable += item.unitPrice * item.quantity;
        groupedByGstRate[rate].tax += item.gstAmount || 0;
      }
    });
  }

  // Use company specific template
  if (isMansan) {
    return (
      <Document>
        <Page size={[226, 'auto']} style={styles.thermalPage}>
          <View style={styles.header}>
            <Text style={styles.thermalCompanyName}>{company.name}</Text>
            <Text style={styles.thermalBillInfo}>{company.address}</Text>
            {company.gstin && <Text style={styles.thermalBillInfo}>GSTIN: {company.gstin}</Text>}
            <Text style={styles.thermalBillInfo}>Bill No: {sale.billNumber} | Date: {new Date(sale.date).toLocaleDateString()}</Text>
            <Text style={styles.thermalBillInfo}>Customer: {sale.customerName}</Text>
          </View>
          
          <View style={styles.tableContainer}>
            <View style={styles.thermalTableHeader}>
              <Text style={styles.thermalDescription}>Item</Text>
              <Text style={styles.thermalQty}>Qty</Text>
              <Text style={styles.thermalRate}>Nt.Rate</Text>
              <Text style={styles.thermalAmount}>Amount</Text>
              <Text style={styles.thermalGst}>GST%</Text>
              <Text style={styles.thermalHsn}>HSN</Text>
            </View>
            
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <View style={styles.thermalTableRow}>
                  <Text style={styles.thermalDescription}>{item.name}</Text>
                  <Text style={styles.thermalQty}>{item.quantity}</Text>
                  <Text style={styles.thermalRate}>₹{item.unitPrice.toFixed(2)}</Text>
                  <Text style={styles.thermalAmount}>₹{(item.unitPrice * item.quantity).toFixed(2)}</Text>
                  <Text style={styles.thermalGst}>{item.gstPercentage || 0}%</Text>
                  <Text style={styles.thermalHsn}>{item.hsnCode || 'N/A'}</Text>
                </View>
                <View style={styles.thermalItemDetails}>
                  <Text>MRP: ₹{(item.mrp || item.unitPrice).toFixed(2)} | 
                    {item.discountValue ? ` Disc: ₹${item.discountValue.toFixed(2)} | ` : ''} 
                    Total: ₹{item.totalPrice.toFixed(2)}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
          
          <View style={styles.thermalTaxSummary}>
            {hasGst && Object.values(groupedByGstRate).map((taxGroup, index) => (
              <View key={index} style={styles.thermalTaxRow}>
                <Text>GST {taxGroup.rate}%:</Text>
                <Text>₹{taxGroup.taxable.toFixed(2)} @{taxGroup.rate}% = ₹{taxGroup.tax.toFixed(2)}</Text>
              </View>
            ))}
            
            {hasGst && Object.values(groupedByGstRate).map((taxGroup, index) => (
              <View key={`split-${index}`} style={styles.thermalTaxRow}>
                <Text>CGST {taxGroup.rate/2}% + SGST {taxGroup.rate/2}%:</Text>
                <Text>₹{(taxGroup.tax/2).toFixed(2)} + ₹{(taxGroup.tax/2).toFixed(2)}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Total Qty:</Text>
              <Text style={styles.summaryValue}>{totalQuantity}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Total Excl. GST:</Text>
              <Text style={styles.summaryValue}>₹{totalExclusiveCost.toFixed(2)}</Text>
            </View>
            {hasDiscount && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTitle}>Total Discount:</Text>
                <Text style={styles.summaryValue}>₹{totalDiscount.toFixed(2)}</Text>
              </View>
            )}
            {hasGst && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTitle}>Total GST:</Text>
                <Text style={styles.summaryValue}>₹{totalGst.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Round Off:</Text>
              <Text style={styles.summaryValue}>₹{roundOff.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.grandTotal]}>
              <Text style={styles.summaryTitle}>Grand Total:</Text>
              <Text style={styles.summaryValue}>₹{roundedGrandTotal.toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text>Thank you for your business!</Text>
          </View>
        </Page>
      </Document>
    );
  } else if (isEstimate) {
    return (
      <Document>
        <Page size={[226, 'auto']} style={styles.thermalPage}>
          <View style={styles.header}>
            <Text style={styles.thermalCompanyName}>{company.name}</Text>
            <Text style={styles.thermalBillInfo}>{company.address || 'Estimate'}</Text>
            <Text style={styles.thermalBillInfo}>Bill No: {sale.billNumber} | Date: {new Date(sale.date).toLocaleDateString()}</Text>
            <Text style={styles.thermalBillInfo}>Customer: {sale.customerName}</Text>
          </View>
          
          <View style={styles.tableContainer}>
            <View style={styles.thermalTableHeader}>
              <Text style={styles.estimateDescription}>Desc</Text>
              <Text style={styles.estimateQty}>Qty</Text>
              <Text style={styles.estimateRate}>Nt.Rt</Text>
              <Text style={styles.estimateAmount}>Nt.Amt</Text>
            </View>
            
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <View style={styles.thermalTableRow}>
                  <Text style={styles.estimateDescription}>{item.name}</Text>
                  <Text style={styles.estimateQty}>{item.quantity}</Text>
                  <Text style={styles.estimateRate}>₹{item.unitPrice.toFixed(2)}</Text>
                  <Text style={styles.estimateAmount}>₹{(item.unitPrice * item.quantity).toFixed(2)}</Text>
                </View>
                {/* Optional second line for packaging details or other notes */}
                {item.packagingDetails && (
                  <View style={styles.thermalItemDetails}>
                    <Text>{item.packagingDetails}</Text>
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Total Qty:</Text>
              <Text style={styles.summaryValue}>{totalQuantity}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Total Amount:</Text>
              <Text style={styles.summaryValue}>₹{totalExclusiveCost.toFixed(2)}</Text>
            </View>
            {hasDiscount && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTitle}>Total Discount:</Text>
                <Text style={styles.summaryValue}>₹{totalDiscount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Round Off:</Text>
              <Text style={styles.summaryValue}>₹{roundOff.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.grandTotal]}>
              <Text style={styles.summaryTitle}>Grand Total:</Text>
              <Text style={styles.summaryValue}>₹{roundedGrandTotal.toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text>Thank you for your business!</Text>
          </View>
        </Page>
      </Document>
    );
  } else {
    // Default template for other companies
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text>{company.address}</Text>
            {company.gstin && <Text>GSTIN: {company.gstin}</Text>}
          </View>
          
          <View style={styles.billInfo}>
            <View style={styles.billInfoCol}>
              <Text>Bill No: {sale.billNumber}</Text>
              <Text>Date: {new Date(sale.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.billInfoCol}>
              <Text>Customer: {sale.customerName}</Text>
            </View>
          </View>
          
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.description}>Item</Text>
              <Text style={styles.qty}>Qty</Text>
              <Text style={styles.mrp}>MRP</Text>
              {hasDiscount && <Text style={styles.discount}>Disc</Text>}
              <Text style={styles.exclCost}>Excl</Text>
              {hasGst && <Text style={styles.gst}>GST</Text>}
              <Text style={styles.total}>Total</Text>
            </View>
            
            {items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.description}>{item.name}</Text>
                <Text style={styles.qty}>{item.quantity}</Text>
                <Text style={styles.mrp}>₹{(item.mrp || item.unitPrice).toFixed(2)}</Text>
                {hasDiscount && (
                  <Text style={styles.discount}>
                    {item.discountValue ? `₹${item.discountValue.toFixed(2)}` : '-'}
                  </Text>
                )}
                <Text style={styles.exclCost}>₹{item.unitPrice.toFixed(2)}</Text>
                {hasGst && (
                  <Text style={styles.gst}>
                    {item.gstPercentage ? `${item.gstPercentage}%` : '-'}
                  </Text>
                )}
                <Text style={styles.total}>₹{item.totalPrice.toFixed(2)}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Total Qty:</Text>
              <Text style={styles.summaryValue}>{totalQuantity}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Total Excl. GST:</Text>
              <Text style={styles.summaryValue}>₹{totalExclusiveCost.toFixed(2)}</Text>
            </View>
            {hasDiscount && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTitle}>Total Discount:</Text>
                <Text style={styles.summaryValue}>₹{totalDiscount.toFixed(2)}</Text>
              </View>
            )}
            {hasGst && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTitle}>Total GST:</Text>
                <Text style={styles.summaryValue}>₹{totalGst.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Round Off:</Text>
              <Text style={styles.summaryValue}>₹{roundOff.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.grandTotal]}>
              <Text style={styles.summaryTitle}>Grand Total:</Text>
              <Text style={styles.summaryValue}>₹{roundedGrandTotal.toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text>Thank you for your business!</Text>
          </View>
        </Page>
      </Document>
    );
  }
};

export const ConsolidatedBillTemplate: React.FC<{ sale: Sale | Sale[] }> = ({ sale }) => {
  // Handle both single sale and array of sales
  const sales = Array.isArray(sale) ? sale : [sale];
  
  // Extract all items from all sales
  const allItems = sales.reduce<SaleItem[]>((acc, s) => [...acc, ...s.items], []);
  
  // Group items by company
  const itemsByCompany = allItems.reduce<Record<string, { company: string, items: SaleItem[] }>>((acc, item) => {
    if (!acc[item.companyId]) {
      acc[item.companyId] = { 
        company: item.companyName,
        items: []
      };
    }
    acc[item.companyId].items.push(item);
    return acc;
  }, {});

  // Calculate totals across all items
  const totalQuantity = allItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalExclusiveCost = allItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalDiscount = allItems.reduce((sum, item) => sum + (item.discountValue || 0), 0);
  const totalGst = allItems.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
  const grandTotal = allItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Round off calculation
  const roundedGrandTotal = Math.round(grandTotal);
  const roundOff = roundedGrandTotal - grandTotal;

  // Check if any item has GST or discount
  const hasGst = allItems.some(item => item.gstPercentage && item.gstPercentage > 0);
  const hasDiscount = allItems.some(item => item.discountValue && item.discountValue > 0);
  
  // Get customer name and date from the first sale
  const customerName = sales[0]?.customerName || 'Guest';
  const date = sales[0]?.date ? new Date(sales[0].date).toLocaleDateString() : new Date().toLocaleDateString();
  const billNumber = sales[0]?.billNumber || `FINAL-${Date.now()}`;

  return (
    <Document>
      <Page size={[226, 'auto']} style={styles.thermalPage}>
        <View style={styles.header}>
          <Text style={styles.thermalCompanyName}>Consolidated Bill</Text>
          <Text style={styles.thermalBillInfo}>Bill No: {billNumber}</Text>
          <Text style={styles.thermalBillInfo}>Date: {date}</Text>
          <Text style={styles.thermalBillInfo}>Customer: {customerName}</Text>
        </View>
        
        {/* Render each company's items */}
        {Object.values(itemsByCompany).map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <Text style={styles.companyHeader}>{group.company}</Text>
            <View style={styles.tableContainer}>
              <View style={styles.thermalTableHeader}>
                <Text style={styles.thermalDescription}>Item</Text>
                <Text style={styles.thermalQty}>Qty</Text>
                <Text style={styles.thermalRate}>Rate</Text>
                <Text style={styles.thermalAmount}>Amount</Text>
              </View>
              
              {group.items.map((item, index) => (
                <View key={index} style={styles.thermalTableRow}>
                  <Text style={styles.thermalDescription}>{item.name}</Text>
                  <Text style={styles.thermalQty}>{item.quantity}</Text>
                  <Text style={styles.thermalRate}>₹{item.unitPrice.toFixed(2)}</Text>
                  <Text style={styles.thermalAmount}>₹{(item.unitPrice * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
        
        <View style={[styles.summaryContainer, { marginTop: 20 }]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>Total Qty:</Text>
            <Text style={styles.summaryValue}>{totalQuantity}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>Total Excl. GST:</Text>
            <Text style={styles.summaryValue}>₹{totalExclusiveCost.toFixed(2)}</Text>
          </View>
          {hasDiscount && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Total Discount:</Text>
              <Text style={styles.summaryValue}>₹{totalDiscount.toFixed(2)}</Text>
            </View>
          )}
          {hasGst && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Total GST:</Text>
              <Text style={styles.summaryValue}>₹{totalGst.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>Round Off:</Text>
            <Text style={styles.summaryValue}>₹{roundOff.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.grandTotal]}>
            <Text style={styles.summaryTitle}>Grand Total:</Text>
            <Text style={styles.summaryValue}>₹{roundedGrandTotal.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};
