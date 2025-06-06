import fetch from 'node-fetch'
import path from 'path'
import fs from 'fs'


export const connectToTally = async()=>{
    try{
        let connectionStatus = false;
        const configPath = path.resolve('./tally.config.json')
        const rawData = fs.readFileSync(configPath,'utf-8')
        const config = JSON.parse(rawData)

        const tallyURL = config.connectionURL
        console.log(`Checking connection to tally at port ${config.port}`);

        //fetch tally server
        const response = await fetch(tallyURL, { timeout: config.timeout });
        if (response.ok) {
            const text = await response.text();
            connectionStatus = true;
            console.log('Connection successful! Response:');
            console.log(text.substring(0, 500));
            return {connectionStatus,tallyURL} // print first 500 chars of response
        } 
        else {
      console.log(`Failed to connect to tally. HTTP status: ${response.status}`);
    }


    }

    catch(err)
    {
        console.log(`Error connecting to Tally Server ${err.message}`);
    }

}