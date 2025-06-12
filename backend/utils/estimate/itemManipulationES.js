import { convert } from '../createSalesFunctions.js'

export function itemManipulationES(items) {
  const newItems = items.map((item) => {
    console.log(item.priceLevelList);
    const { quantity: billed_qty, salesUnit: billed_unit, allUnits: all_units, priceLevelList: price_level_list } = item;
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
    item.total_amount = parseFloat((applicable_rate - (applicable_rate * item.discountPercent / 100)).toFixed(2)); // subtracting discount
    item.applicable_rate = parseFloat((applicable_rate / billed_qty).toFixed(2));
    console.log("after manipulation", item);
    return item;
  });
  console.log("after manipulation items", newItems);
  return newItems;
}
