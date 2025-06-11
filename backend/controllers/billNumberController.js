import { getNextBillNumber, peekBillNumber } from '../utils/billNumberManager.js';

export function getBillNumber (req, res)  {
  const { companyKey } = req.params;
  console.log("companyKey",companyKey)
  const decodedCompanyKey = decodeURIComponent(companyKey).trim()
  try {
    const billNumber = peekBillNumber(decodedCompanyKey);
    console.log(billNumber)
    res.json({ billNumber });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export function incrementBillNumber (req, res)  {
  const { companyKey } = req.params;
  const decodedCompanyKey = decodeURIComponent(companyKey)
  try {
    const billNumber = getNextBillNumber(decodedCompanyKey);
    res.json({ billNumber });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 