import express from 'express';
const router = express.Router();
import { getBillNumber, incrementBillNumber } from '../controllers/billNumberController.js';

// GET current bill number for a company
router.get('/:companyKey', getBillNumber);

// POST to increment and get the next bill number for a company
router.post('/:companyKey/increment', incrementBillNumber);

export default router;