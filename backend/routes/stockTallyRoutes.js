import express from 'express'
import { getStocks } from '../controllers/getStocks.js';

const router = express.Router();

//route to fetch all stock items from Tally
router.post('/fetch-items',getStocks)

export default router