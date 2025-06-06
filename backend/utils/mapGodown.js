export const mapGodown = (godownJSON,priceListJSON) => {
    const godownMap = new Map();
    
    //setting godownMap
    for(const item of godownJSON){
        godownMap.set(item.name?.trim(),item)
    }

    // console.log(godownMap)

    const enrichedPriceList = priceListJSON.map((priceItem)=>{

        const match = godownMap.get(priceItem.item_name?.trim())
        //
        if(match)
        {
            console.log(match,true)
            const {godowns} = match;
            const godownDetails  = godowns.map((gd)=>({
                name : gd.name,
                quantity : gd.qty
            }))

            return {
                ...priceItem,
                godowns : godownDetails,
            }
        }

        else {
            return {
                ...priceItem,
                godowns : [],
            }
        }          


}
    )
    // console.log(enrichedPriceList)

return enrichedPriceList;

}
 