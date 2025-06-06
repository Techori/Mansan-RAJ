export default function extractMRP(string){
    const match = string.match(/Mrp(\d+)/i)
    return match ? match[1] : ''

}