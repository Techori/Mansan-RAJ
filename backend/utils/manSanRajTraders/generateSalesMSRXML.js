import { tallyRoundOff } from '../createSalesFunctions.js';

export function generateSalesMSRXML(companyName, priceLevel, voucherNumber, partyLedger, items, narration, tax_info, enteredBy) {

  let totalBillAmount = 0;
  const date = new Date().toISOString().slice(0, 10).split('-').join('')
  // const date = '20250602';

  

  const salesLedgerNameXML = (gst_rate) => {
    if (gst_rate === 0) {
      return `<LEDGERNAME>SALES@EXEMPTED</LEDGERNAME>`
    } else {
      return `<LEDGERNAME>Sales@${gst_rate}%</LEDGERNAME>`;
    }

  }
  // Inventory Lines
  const itemLinesXML = items.map(item => {
    // Calculate the item's value AFTER discount, but BEFORE tax
    const { quantity: billed_qty, applicable_rate, name: item_name, salesUnit: billed_unit, gstPercentage: gst_rate } = item;
    const grossItemValue = (billed_qty * applicable_rate);
    const discountAmountForItem = grossItemValue * parseFloat((item.discountPercent / 100).toFixed(2));
    const netItemValueExcludingTax = grossItemValue - discountAmountForItem;
    totalBillAmount += (parseFloat((netItemValueExcludingTax).toFixed(2)) + item.tax_ledgers[0].amount + item.tax_ledgers[1].amount)

    // Conditionally include the <DISCOUNT> tag
    const discountTag = item.discountPercent > 0 ? `<DISCOUNT> ${item.discountPercent}</DISCOUNT>` : '';

    return `<ALLINVENTORYENTRIES.LIST>
      <STOCKITEMNAME>${item_name}</STOCKITEMNAME>
      <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
      <RATE>${applicable_rate.toFixed(2)}/${billed_unit}</RATE>
      ${discountTag}
      <AMOUNT>${netItemValueExcludingTax.toFixed(2)}</AMOUNT>
      <ACTUALQTY>${billed_qty} ${billed_unit}</ACTUALQTY>
      <BILLEDQTY>${billed_qty} ${billed_unit}</BILLEDQTY>
      <BATCHALLOCATIONS.LIST>
        <GODOWNNAME>${item.godown}</GODOWNNAME>
        <BATCHNAME>Primary Batch</BATCHNAME>
        <DESTINATIONGODOWNNAME>${item.godown}</DESTINATIONGODOWNNAME>
        <AMOUNT>${netItemValueExcludingTax.toFixed(2)}</AMOUNT>
        <ACTUALQTY>${billed_qty} ${billed_unit}</ACTUALQTY>
        <BILLEDQTY>${billed_qty} ${billed_unit}</BILLEDQTY>
      </BATCHALLOCATIONS.LIST>
      <ACCOUNTINGALLOCATIONS.LIST>
        ${salesLedgerNameXML(gst_rate)}
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>${netItemValueExcludingTax.toFixed(2)}</AMOUNT> </ACCOUNTINGALLOCATIONS.LIST>
    </ALLINVENTORYENTRIES.LIST>
  `;
  }).join('\n');
  // console.log(totalBillAmount.toFixed(2));
  const { roundedTotal, roundOffAmount, isNegative } = tallyRoundOff(totalBillAmount);
  totalBillAmount = roundedTotal;
  // console.log(totalBillAmount);

  const roundOffXML =
    `<LEDGERENTRIES.LIST>
      <LEDGERNAME>Round Off</LEDGERNAME>
      <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
      <AMOUNT>${isNegative ? '-' : ''}${roundOffAmount}</AMOUNT>
    </LEDGERENTRIES.LIST>`;

  // Customer Ledger Block
  const customerLedgerXML = `
    <LEDGERENTRIES.LIST>
      <LEDGERNAME>${partyLedger}</LEDGERNAME>
      <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
      <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
      <AMOUNT>-${totalBillAmount}</AMOUNT>
      <BILLALLOCATIONS.LIST>
        <NAME>${voucherNumber}</NAME>
        <BILLTYPE>New Ref</BILLTYPE>
        <AMOUNT>-${totalBillAmount}</AMOUNT>
      </BILLALLOCATIONS.LIST>
    </LEDGERENTRIES.LIST>`;

  // Tax Ledgers (CGST + SGST)
  const taxLedgerXML = tax_info.map(tax => `<LEDGERENTRIES.LIST>
      <LEDGERNAME>${tax.ledger}</LEDGERNAME>
      <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
      <AMOUNT>${tax.amount.toFixed(2)}</AMOUNT>
    </LEDGERENTRIES.LIST>`).join('\n');



  const priceLevelXML = priceLevel && `<PRICELEVEL>${priceLevel}</PRICELEVEL>`;

  const svPriceLevel = priceLevel && `<SVPRICELEVEL>${priceLevel}</SVPRICELEVEL>`;

  const now = new Date();
  const dateTime = now.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });

  const enteredByXML = `
  <UDF:GVCHCREATEDBY.LIST DESC="\`GVchCreatedBy\`" ISLIST="YES" TYPE="String" INDEX="2202">
    <UDF:GVCHCREATEDBY DESC="\`GVchCreatedBy\`">${enteredBy}</UDF:GVCHCREATEDBY>
  </UDF:GVCHCREATEDBY.LIST>
  `;

  const dateTimeXML = `
  <UDF:BSINVDATETIME.LIST DESC="\`BSInvDateTime\`" ISLIST="YES" TYPE="String" INDEX="2201">
    <UDF:BSINVDATETIME DESC="\`BSInvDateTime\`">${dateTime}</UDF:BSINVDATETIME>
  </UDF:BSINVDATETIME.LIST>
  `;


  return `
<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Import</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>Vouchers</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
        ${svPriceLevel}
      </STATICVARIABLES>
    </DESC>
    <DATA>
      <TALLYMESSAGE>
        <VOUCHER VCHTYPE="Tax Invoice" ACTION="Create" ASVCHCLASS="GST Class Sales">
          <DATE>${date}</DATE>
          <VOUCHERTYPENAME>Tax Invoice</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${voucherNumber}</VOUCHERNUMBER>
          <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
          <ISINVOICE>Yes</ISINVOICE>
          <OBJVIEW>Invoice Voucher View</OBJVIEW>
          ${priceLevelXML}
          <PARTYLEDGERNAME>${partyLedger}</PARTYLEDGERNAME>
          <BASICBUYERNAME>${partyLedger}</BASICBUYERNAME>
          <ENTEREDBY>${enteredBy}</ENTEREDBY>
          <NARRATION>${narration}</NARRATION>
          <CLASSNAME>GST Class Sales</CLASSNAME> 
          ${itemLinesXML}
          ${customerLedgerXML}
          ${taxLedgerXML}
          ${roundOffAmount == 0.00 ? '' : roundOffXML}
          ${dateTimeXML}
          ${enteredByXML}
        </VOUCHER>
      </TALLYMESSAGE>
    </DATA>
  </BODY>
</ENVELOPE>`.trim(); // replace(/\n/g, '').trim();
}



// const xml = generateSalesMSRXML("ManSan Raj Traders", "Retail", "pos-1", "20250602", "Tax Invoice", "Cash", items, "narration by PM", filteredTaxInfo, "Pranav");
// console.log(xml);

// fs.writeFileSync("test.xml", xml);

// companyName, pricelevel, voucherNumber, date, voucherType, partyLedger, items, narration, totalAmount, time

// items = [
//   {
//     "item_name": "Amul Butter 100g Mrp60 1case*150pcs**",
//     "godown": "Main Location",
//     "all_units": "case of 150 pcs",
//     "billed_qty": 2,
//     "billed_unit": "pcs",
//     "gst_rate": 12,
//     "discountPercent": 5,
//   }
// ]