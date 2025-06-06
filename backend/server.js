import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connectToTally } from './config/tally.config.js';
import stockTallyRoutes from './routes/stockTallyRoutes.js';
import customerTallyRoutes from './routes/customerTallyRoutes.js';



const app = express();
//cross-origin
app.use(cors())
dotenv.config()

//json parsing
app.use(express.json())
const PORT = process.env.PORT || 3000


app.get("/",(req,res)=>{
    console.log('All OK');
    res.send("ALL OK")
})

//checking connection to Tally Prime
const connectionStatus = await connectToTally();
console.log(connectionStatus);

if(connectionStatus)
{
    //tally is connected successfully....
    //Routes
    //fetch stocks
    app.use('/api/tally/stocks', stockTallyRoutes)
    //fetch customers
    app.use('/api/tally/customers', customerTallyRoutes)

    //NOW CALL TALLY-RELATED APISN HERE...
}


app.listen(PORT,()=>{
    console.log(`Node.js Backend Server is listening on Port ${PORT}`);
})
