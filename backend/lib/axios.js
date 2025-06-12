import axios from 'axios'
import path from 'path'
import fs from 'fs'

const configPath = path.resolve('./tally.config.json')
const rawData = fs.readFileSync(configPath, 'utf-8')
const config = JSON.parse(rawData)

const tallyURL = config.connectionURL;
const instance = axios.create({
  baseURL: tallyURL,
  headers: {
    'Content-Type': 'text/xml',
    'Accept': 'text/xml'
  }
});

export default instance;