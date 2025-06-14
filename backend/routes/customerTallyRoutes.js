import express from 'express';
import { getLedgers } from '../controllers/getLedgers.js';
import { createLedger } from '../controllers/createLedger.js';

const router = express.Router();

router.post('/fetch-ledgers', getLedgers)
router.post('/create-ledger', createLedger)

export default router;
