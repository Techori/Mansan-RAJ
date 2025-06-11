import fs from 'fs'
import {dirname} from 'path';
import { fileURLToPath } from 'url';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BILL_NUMBERS_PATH = path.join(__dirname, 'billNumbers.json');

export function readBillNumbers() {
  if (!fs.existsSync(BILL_NUMBERS_PATH)) {
    // Default values if file doesn't exist
    return { companyA: 100001, companyB: 200001 };
  }

  const data = fs.readFileSync(BILL_NUMBERS_PATH, 'utf-8');
  console.log(data)
  return JSON.parse(data);
}

export function writeBillNumbers(billNumbers) {
  fs.writeFileSync(BILL_NUMBERS_PATH, JSON.stringify(billNumbers, null, 2));
}

export function getNextBillNumber(companyKey) {
  const billNumbers = readBillNumbers();
  if (!billNumbers[companyKey]) {
    throw new Error('Invalid company key');
  }
  const nextNumber = billNumbers[companyKey];
  billNumbers[companyKey] = nextNumber + 1;
  writeBillNumbers(billNumbers);
  return nextNumber;
}

export function peekBillNumber(companyKey) {
  const billNumbers = readBillNumbers();
  console.log(billNumbers[companyKey])
  if (!billNumbers[companyKey]) {
    throw new Error('Invalid company key');
  }
  return billNumbers[companyKey];
}

