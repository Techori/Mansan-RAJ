import express from 'express';
import { getLedgers } from '../controllers/getLedgers.js';

const router = express.Router();

router.post('/fetch-ledgers', getLedgers)


export default router;