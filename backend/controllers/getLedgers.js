import fs from 'fs'
import path from 'path'
import {fetchCustomerXML} from '../utils/xmlBuilder.js'
import {parseCustomersXML} from '../utils/xmlParsingCustomers.js'

export async function getLedgers(req,res){

    const config = JSON.parse(fs.readFileSync(path.resolve('./tally.config.json'),'utf-8')) 
    const tallyURL = config.connectionURL

    const ledgerXml1 = fetchCustomerXML('ManSan Raj Traders')
    const ledgerXml2 = fetchCustomerXML('Estimate')

    //making http request to tallyServer
//For ManSan Raj Traders
    try{
        const [ledgerResponse1,ledgerResponse2] = await Promise.all([
            
            fetch(tallyURL, {
            method : 'POST',
            headers : {
                'Content-Type' : 'text/xml'
            },
            body : ledgerXml1
        }),
//For Estimate
        fetch(tallyURL, {
            method : 'POST',
            headers : {
                'Content-Type' : 'text/xml'
            },
            body : ledgerXml2
        })
    ])



    const ledgerText1 = await ledgerResponse1.text();
    const ledgerText2 = await ledgerResponse2.text();


    const ledgerJSON1 = parseCustomersXML(ledgerText1)
    const ledgerJSON2 = parseCustomersXML(ledgerText2)

    const finalLedgerJSON = [...ledgerJSON1, ...ledgerJSON2]
    res.json(finalLedgerJSON)

    
    

        
    }

    //


    catch(error){
        console.error('Error fetching ledgers:', error)
        res.status(500).json({error : 'Failed to fetch ledgers'})
    }









}