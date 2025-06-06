import fs from 'fs';
import path from 'path';


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
