import express from 'express'
import { postSales } from '../controllers/postSales.js';


const router = express.Router();

router.post('/create-sale',postSales)





export default router;