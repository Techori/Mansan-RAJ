import fs from 'fs'
import path from 'path'
import {generateTallyLedgerXML} from '../utils/createLedgerXML.js'
import {parseCustomersXML} from '../utils/xmlParsingCustomers.js'

export async function getLedgers(req,res){

    const config = JSON.parse(fs.readFileSync(path.resolve('./tally.config.json'),'utf-8')) 
    const tallyURL = config.connectionURL

    const ledgerXml = generateTallyLedgerXML()


    try{
        const ledgerResponse = await fetch(tallyURL, {
            method : 'POST',
            headers : {
                'Content-Type' : 'text/xml'
            },
            body : ledgerXml
        })

        const ledgerResponseText = await ledgerResponse.text()
        const parsedLedgers = parseCustomersXML(ledgerResponseText)
        res.json(parsedLedgers)
    }




    
    

        
    

    //


    catch(error){
        console.error('Error fetching ledgers:', error)
        res.status(500).json({error : 'Failed to fetch ledgers'})
    }









}