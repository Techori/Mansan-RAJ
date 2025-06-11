import { generateSalesMSRXML } from '../utils/manSanRajTraders/generateSalesMSRXML.js';
import { itemManipulationMSR } from '../utils/manSanRajTraders/itemManipulationMSR.js';

export async function postSales (req ,res) {

   
    // console.log('req.body',req.body)
    //items --> manipulate
    //xml --> generate sales xml

    console.log('In postSales',req.body)
    const salesData = req.body;

    if(salesData.companyName === "ManSan Raj Traders"){
        const manipulatedItems = itemManipulationMSR(salesData.items);
        const narration = salesData.customerMobile + " - " + salesData.createdBy
        const xml = generateSalesMSRXML(salesData.companyName,salesData.priceLevel,salesData.taxInvoiceNo,salesData.customerName,manipulatedItems,narration,salesData.tax_info,salesData.enteredBy);
        console.log('xml',xml)
    }
    if(req.body) res.status(200).json("All OK")


    
}