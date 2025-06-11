import { convert } from '../createSalesFunctions.js';

//give items as input

export function itemManipulationMSR(items) {

  const newItems = items.map((item) => {
    const { billed_qty, billed_unit, all_units } = item;

    item.standard_unit = item.price_level_list[0].rate.split('/').pop();

    let standardQty = billed_qty; // billed_unit === standard_unit

    if (billed_unit !== item.standard_unit) {

      standardQty = convert(billed_qty, billed_unit, item.standard_unit, all_units);
    }

    for (const rList of item.price_level_list) {
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
    if (item.gst_rate > 0) {
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

      tax_ledgers[0].rate = tax_ledgers[1].rate = item.gst_rate / 2;
      iTax = applicable_rate * item.gst_rate / 100;
      tax_ledgers[0].amount = tax_ledgers[1].amount = iTax / 2;

      item.tax_ledgers = tax_ledgers;
    }

    item.total_amount = item.amount_excl_gst + iTax;


    return item;
  });

  // console.log(newItems);
  // console.log(newItems[0].tax_ledgers);
  // console.log(newItems[1].tax_ledgers);
  return newItems;
 
}