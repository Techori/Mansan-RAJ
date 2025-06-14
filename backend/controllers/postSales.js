import { generateSalesMSRXML } from '../utils/manSanRajTraders/generateSalesMSRXML.js';
import { itemManipulationMSR } from '../utils/manSanRajTraders/itemManipulationMSR.js';
import path from 'path'
import fs from 'fs'
import { itemManipulationES } from '../utils/estimate/itemManipulationES.js';
import generateSalesESXML from '../utils/estimate/generateSalesESXML.js';
import xml2js from 'xml2js'


const configPath = path.resolve('./tally.config.json')
const rawData = fs.readFileSync(configPath, 'utf-8')
const config = JSON.parse(rawData)
const tallyURL = config.connectionURL;


export async function postSales(req, res) {
    // console.log('req.body',req.body)
    //items --> manipulate
    //xml --> generate sales xml

    console.log('In postSales', req.body)
    const salesData = req.body;

    if (salesData.companyName === "ManSan Raj Traders") {
        try {
            const { newItems, filteredTaxInfo: taxInfo } = itemManipulationMSR(salesData.items);

            const narration = salesData.customerMobile + " - " + salesData.createdBy;

            // Assuming generateSalesMSRXML is correctly defined elsewhere and returns the XML string
            const xml = generateSalesMSRXML(salesData.companyName, salesData.priceLevel, salesData.taxInvoiceNo, salesData.customerName, newItems, narration, taxInfo, salesData.createdBy);
            console.log('Generated XML:', xml); // Changed console.log message

            const response = await fetch(tallyURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml',
                    'Accept': 'text/xml'
                },
                body: xml
            });

            if (!response.ok) {
                const errorText = await response.text();
                // If HTTP status is not OK, it's an error from the server itself (e.g., 404, 500)
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const responseText = await response.text();
            console.log("Raw Tally Response:", responseText); // Log raw response for debugging
            const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });

            // Use a Promise-based approach for xml2js for easier async handling
            const parseXml = () => {
                return new Promise((resolve, reject) => {
                    parser.parseString(responseText, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            };

            const parsedResponse = await parseXml();

            let createdCount = 0;
            let lastVoucherId = null; // Will store LASTVCHID if successful

            // Check if IMPORTRESULT exists and extract CREATED count and LASTVCHID
            if (parsedResponse &&
                parsedResponse.ENVELOPE &&
                parsedResponse.ENVELOPE.BODY &&
                parsedResponse.ENVELOPE.BODY.DATA &&
                parsedResponse.ENVELOPE.BODY.DATA.IMPORTRESULT) {
                const importResult = parsedResponse.ENVELOPE.BODY.DATA.IMPORTRESULT;
                createdCount = parseInt(importResult.CREATED, 10);
                lastVoucherId = importResult.LASTVCHID; // Directly get LASTVCHID
            }
            res.json({ createdCount, lastVoucherId });
        } catch (error) {
            console.error("Error sending request to Tally:", error);
            // For network/parsing errors outside of Tally's expected response format
            res.json({ createdCount: 0, lastVoucherId: -1 });
        }

    } else if (salesData.companyName === "Estimate") {
        try {
            const newItems = itemManipulationES(salesData.items);
            console.log("in ES", newItems);

            const narration = salesData.customerMobile + " - " + salesData.createdBy;

            const xml = generateSalesESXML(salesData.companyName, salesData.priceLevel, salesData.estimateNo, salesData.customerName, newItems, narration, salesData.createdBy);
            console.log('xml', xml);

            const response = await fetch(tallyURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml',
                    'Accept': 'text/xml'
                },
                body: xml
            });
            if (!response.ok) {
                const errorText = await response.text();
                // If HTTP status is not OK, it's an error from the server itself (e.g., 404, 500)
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const responseText = await response.text();
            console.log("Raw Tally Response:", responseText); // Log raw response for debugging
            const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });

            // Use a Promise-based approach for xml2js for easier async handling
            const parseXml = () => {
                return new Promise((resolve, reject) => {
                    parser.parseString(responseText, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            };

            const parsedResponse = await parseXml();

            let createdCount = 0;
            let lastVoucherId = null; // Will store LASTVCHID if successful

            // Check if IMPORTRESULT exists and extract CREATED count and LASTVCHID
            if (parsedResponse &&
                parsedResponse.ENVELOPE &&
                parsedResponse.ENVELOPE.BODY &&
                parsedResponse.ENVELOPE.BODY.DATA &&
                parsedResponse.ENVELOPE.BODY.DATA.IMPORTRESULT) {
                const importResult = parsedResponse.ENVELOPE.BODY.DATA.IMPORTRESULT;
                createdCount = parseInt(importResult.CREATED, 10);
                lastVoucherId = importResult.LASTVCHID; // Directly get LASTVCHID
            }
            res.json({ createdCount, lastVoucherId });
        } catch (error) {
            console.error("Error sending request to Tally:", error);
            // For network/parsing errors outside of Tally's expected response format
            res.json({ createdCount: 0, lastVoucherId: -1 });
        }

    }

}