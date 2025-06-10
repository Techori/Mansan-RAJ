export async function postSales (req ,res) {
    console.log('In postSales',req.body)
    if(req.body) res.status(200).json("All OK")


    
}