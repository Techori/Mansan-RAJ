// import {fetchStockGodownsXML} from "../utils/xmlBuilder.js";
// import fs from 'fs'
// import path from "path";
// import {fetchStockItemPriceListXML} from "../utils/xmlBuilder.js";
// import {parseStockItemPriceList} from "../utils/xmlParsingPriceList.js";
// import parseStockItemGodown from "../utils/xmlParsingGodowns.js";
// import {mapGodown} from "../utils/mapGodown.js";

// export async function getStocks(req,res){
//     //obtaining tallyURL from config file
//     const config = JSON.parse(fs.readFileSync(path.resolve('./tally.config.json'),'utf-8')) 
//     const tallyURL = config.connectionURL



//     const godownXml1 = fetchStockGodownsXML(
//         {
//             requestType : 'Export',
//             companyName : 'ManSan Raj Traders'
//         }
//     );

//     const godownXml2 = fetchStockGodownsXML(
//         {
//             requestType : 'Export',
//             companyName : 'Estimate'
//         }
//     );

//     const priceListXml1 = fetchStockItemPriceListXML({companyName : 'ManSan Raj Traders'})
//     const priceListXml2 = fetchStockItemPriceListXML({companyName : 'Estimate'})


//     try{
//         //making http request to tallyServer
//         //price list

//         const [godownResponse1, priceListResponse1,godownResponse2,priceListResponse2] = await Promise.all([
//             fetch(tallyURL, {
//               method: 'POST',
//               headers: { 'Content-Type': 'text/xml' },
//               body: godownXml1
//             }),
//             fetch(tallyURL, {
//               method: 'POST',
//               headers: { 'Content-Type': 'text/xml' },
//               body: priceListXml1
//             }),
//             fetch(tallyURL, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'text/xml' },
//                 body: godownXml2
//               }),
//               fetch(tallyURL, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'text/xml' },
//                 body: priceListXml2
//               })
//           ]);
        

//         const godownText = await godownResponse1.text()
//         const priceListText = await priceListResponse1.text()
//         const godownText2 = await godownResponse2.text()
//         const priceListText2 = await priceListResponse2.text()

//         const godownJSON = await parseStockItemGodown(godownText, 'ManSan Raj Traders')
//         const priceListJSON = await parseStockItemPriceList(priceListText, 'Estimate')
//         const godownJSON2 = await parseStockItemGodown(godownText2, 'Estimate')
//         const priceListJSON2 = await parseStockItemPriceList(priceListText2, 'Estimate')
//         // const finalGodownJSON = JSON.stringify(godownJSON,null,2)


//         // console.log(godownJSON)
//         // res.send(godownJSON)
//         // console.log(priceListJSON)
    
//         const mergedJSON1 = mapGodown(godownJSON,priceListJSON);
//         const mergedJSON2 = mapGodown(godownJSON2,priceListJSON2);
//         // console.log(mergedJSON)
//         // console.log(price)
//         res.json(mergedJSON2)
    
//         // const priceListJSON = await parseStockItemPriceList(priceListResponse.text(), 'ManSan Raj Traders')
//         //final output contains item name, mrp, company name, godown name, stock qty, godown rate
//         // res.status(200).send({
//         //     // godowns : finalGodownJSON,
//         //     stocksJSON:priceListJSON
//         // })

//         //we will store godowns in hashmap and 

        
    

//     }

//     catch(err)
//     {
//         console.log(`Error communicating with tally${err.message}`);
//         throw err
//     }


// }

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

import { fetchStockGodownsXML, fetchStockItemPriceListXML } from '../utils/xmlBuilder.js';
import parseStockItemGodown from '../utils/xmlParsingGodowns.js';
import { parseStockItemPriceList } from '../utils/xmlParsingPriceList.js';
import { mapGodown } from '../utils/mapGodown.js';

const configPath = path.resolve('./tally.config.json');
const { connectionURL: tallyURL } = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const companies = ['ManSan Raj Traders', 'Estimate'];

async function fetchCompanyData(companyName) {
  const [godownXML, priceListXML] = [
    fetchStockGodownsXML({ requestType: 'Export', companyName }),
    fetchStockItemPriceListXML({ companyName }),
  ];

  const [godownRes, priceListRes] = await Promise.all([
    fetch(tallyURL, { method: 'POST', headers: { 'Content-Type': 'text/xml' }, body: godownXML }),
    fetch(tallyURL, { method: 'POST', headers: { 'Content-Type': 'text/xml' }, body: priceListXML }),
  ]);

  const [godownText, priceListText] = await Promise.all([
    godownRes.text(),
    priceListRes.text(),
  ]);

  const [godownJSON, priceListJSON] = await Promise.all([
    parseStockItemGodown(godownText, companyName),
    parseStockItemPriceList(priceListText, companyName),
  ]);

  return mapGodown(godownJSON, priceListJSON);
}

export async function getStocks(req, res) {
  try {
    const results = await Promise.all(companies.map(fetchCompanyData));
    const finalResult = results.flat(); // flatten in case each result is an array
    res.json(finalResult);
  } catch (err) {
    console.error(`Error communicating with Tally: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}
