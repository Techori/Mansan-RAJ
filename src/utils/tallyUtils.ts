
import { Sale, SaleItem, Company } from '../types';

// Function to generate XML for Tally integration
export const generateTallyXML = (sale: Sale, company: Company): string => {
  const date = new Date(sale.date);
  const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  
  let voucherType = 'Sales';
  let ledgerName = sale.billType === 'GST' ? 'GST Sales' : 'Non-GST Sales';
  
  // Start building XML
  let xml = `
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="${voucherType}" ACTION="Create">
            <DATE>${formattedDate}</DATE>
            <NARRATION>Sale to ${sale.customerName}</NARRATION>
            <VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME>
            <REFERENCE>${sale.billNumber}</REFERENCE>
            <VOUCHERNUMBER>${sale.billNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${sale.customerName}</PARTYLEDGERNAME>
  `;
  
  if (sale.billType === 'GST') {
    xml += `
            <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
    `;
  }
  
  // Add inventory entries
  sale.items.forEach(item => {
    xml += `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${ledgerName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${item.totalAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <INVENTORYENTRIES.LIST>
              <STOCKITEMNAME>${item.name}</STOCKITEMNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <RATE>${item.unitPrice}</RATE>
              <AMOUNT>-${item.unitPrice * item.quantity}</AMOUNT>
              <ACTUALQTY>${item.quantity}</ACTUALQTY>
              <BILLEDQTY>${item.quantity}</BILLEDQTY>
    `;
    
    if (sale.billType === 'GST' && item.gstPercentage && item.gstAmount) {
      xml += `
              <GSTRATE>${item.gstPercentage}</GSTRATE>
      `;
    }
    
    xml += `
            </INVENTORYENTRIES.LIST>
    `;
  });
  
  // Close XML tags
  xml += `
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>
  `;
  
  return xml;
};

// Function to push XML to Tally
export const pushToTally = async (xml: string): Promise<boolean> => {
  try {
    // In a real implementation, this would use an HTTP request to send XML to Tally
    // For this mock implementation, we'll just log and return success
    console.log('Pushing to Tally:', xml);
    
    // Simulating a successful response from Tally
    return true;
  } catch (error) {
    console.error('Error pushing to Tally:', error);
    return false;
  }
};
