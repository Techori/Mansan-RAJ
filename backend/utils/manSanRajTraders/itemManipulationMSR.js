import { convert } from '../createSalesFunctions.js';

export function itemManipulationMSR(items) {
  const newItems = items.map((item) => {
    const { quantity: billed_qty, salesUnit: billed_unit, allUnits: all_units, priceLevelList: price_level_list, gstPercentage: gst_rate } = item;
    if (!item.discountPercent) { item.discountPercent = 0 };

    item.standard_unit = price_level_list[0].rate.split('/').pop();

    let standardQty = billed_qty; // billed_unit === standard_unit

    if (billed_unit !== item.standard_unit) {

      standardQty = convert(billed_qty, billed_unit, item.standard_unit, all_units);
    }

    for (const rList of price_level_list) {
      const start = parseInt(rList.starting_from.split(' ').shift()) || 0;
      const end = parseInt(rList.ending_at.split(' ').shift()) || Infinity;

      if (start <= standardQty && standardQty <= end) {
        item.standard_rate = rList.rate.split('/').shift();
      }
    }

    const applicable_rate = standardQty * item.standard_rate;
    item.amount_excl_gst = parseFloat((applicable_rate - (applicable_rate * item.discountPercent / 100)).toFixed(2)); // subtracting discount
    item.applicable_rate = parseFloat((applicable_rate / billed_qty).toFixed(2));

    let iTax = 0;
    if (gst_rate > 0) {
      const tax_ledgers = [
        {
          "ledger": "CGST",
          "rate": 0,
          "amount": 0
        },
        {
          "ledger": "SGST",
          "rate": 0,
          "amount": 0
        }
      ]

      tax_ledgers[0].rate = tax_ledgers[1].rate = gst_rate / 2;
      iTax = applicable_rate * gst_rate / 100;
      tax_ledgers[0].amount = tax_ledgers[1].amount = parseFloat((iTax / 2).toFixed(2));

      item.tax_ledgers = tax_ledgers;
    }

    item.total_amount = parseFloat((item.amount_excl_gst + iTax).toFixed(2));


    return item;
  });

  const taxInfo = [
    {
      "ledger": "CGST@2.5%",
      "amount": 0
    },
    {
      "ledger": "SGST@2.5%",
      "amount": 0
    },
    {
      "ledger": "CGST@6%",
      "amount": 0
    },
    {
      "ledger": "SGST@6%",
      "amount": 0
    },
    {
      "ledger": "CGST@9%",
      "amount": 0
    },
    {
      "ledger": "SGST@9%",
      "amount": 0
    },
    {
      "ledger": "CGST@14%",
      "amount": 0
    },
    {
      "ledger": "SGST@14%",
      "amount": 0
    }
  ];

  newItems.forEach((item) => {
    if (item.tax_ledgers) {
      item.tax_ledgers.forEach((tax) => {
        const matchingTax = taxInfo.find((taxInfo) => taxInfo.ledger === `${tax.ledger}@${tax.rate}%`);
        if (matchingTax) {
          matchingTax.amount += tax.amount;
        } else {
          if (tax.ledger === "SGST" && tax.rate === 2.5) {
            taxInfo[1].amount += tax.amount;
          } else if (tax.ledger === "CGST" && tax.rate === 2.5) {
            taxInfo[0].amount += tax.amount;
          }
        }
      });
    }
  });

  // remove the zeros

  const filteredTaxInfo = taxInfo.filter(tax => tax.amount !== 0);

  return { newItems, filteredTaxInfo };
}