import { generateTallyLedgerXML } from '../utils/createLedgerXML.js';
import xml2js from 'xml2js';
import fs from 'fs';
import path from 'path';


const config = JSON.parse(fs.readFileSync(path.resolve('./tally.config.json'), 'utf-8'))
const tallyURL = config.connectionURL

export async function createLedger(req, res) {
    try {
        // Extract parameters from request body
        const {
            companyName,
            name: ledgerName,
            groupName,
            address,
            stateName,
            pincode,
            gstNumber: partyGst
        } = req.body;

        console.log("req.body in createLedger", req.body);

        // Validate required fields
        if (!ledgerName || !groupName || !address) {
            return res.status(400).json({
                error: 'Missing required fields: companyName, ledgerName, groupName, and address are mandatory'
            });
        }

        // Generate XML using the function
        const xml1 = generateTallyLedgerXML(
            "ManSan Raj Traders",
            ledgerName,
            groupName,
            address,
            stateName || null,
            pincode || null,
            partyGst || null
        );

        const xml2 = generateTallyLedgerXML(
            "Estimate",
            ledgerName,
            groupName,
            address,
            stateName || null,
            pincode || null,
            partyGst || null
        );

        // Send XML to TallyPrime using fetch
        const[response1, response2] = await Promise.all([
            fetch(tallyURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml'
                },
                body: xml1
            }),
            fetch(tallyURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml'
                },
                body: xml2
            })
        ])

        // Get response text from TallyPrime
        const responseText1 = await response1.text();
        console.log("responseText1 in createLedger", responseText1);
        const responseText2 = await response2.text();
        console.log("responseText2 in createLedger", responseText2);
        // Parse XML response
        let parsedResponse1;
        let parsedResponse2;

        try {
            parsedResponse1 = await xml2js.parseStringPromise(responseText1);
            parsedResponse2 = await xml2js.parseStringPromise(responseText2);

        } catch (parseError) {
            return res.status(500).json({
                error: 'Failed to parse TallyPrime response',
                details: parseError.message,
                tallyResponse: responseText1
            });
        }

        // Extract CREATED value from the new structure
        const createdValue1 = parsedResponse1?.ENVELOPE?.BODY?.[0]?.DATA?.[0]?.IMPORTRESULT?.[0]?.CREATED?.[0] || '0';
        const createdValue2 = parsedResponse2?.ENVELOPE?.BODY?.[0]?.DATA?.[0]?.IMPORTRESULT?.[0]?.CREATED?.[0] || '0';

        // Check if CREATED is 1 for success
        if (createdValue1 === '1' && createdValue2 === '1') {
            console.log("Ledger created successfully in TallyPrime", {responseText1});
            return res.status(200).json({
                message: 'Ledger created successfully in TallyPrime',
                tallyResponse: {responseText1,responseText2}
            });
        } else {
            return res.status(400).json({
                error: 'Ledger creation failed in TallyPrime',
                details: `CREATED value is ${createdValue1} and ${createdValue2}. Check TallyPrime for details (e.g., duplicate ledger or invalid parent group).`,
                tallyResponse: {responseText1, responseText2}
            });
        }
    } catch (error) {
        // Handle errors (e.g., TallyPrime server unreachable)
        res.status(500).json({
            error: 'Failed to process ledger creation',
            details: error.message
        });
    }
}