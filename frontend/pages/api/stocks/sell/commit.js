export default async function commitSell(req, res){
    const response = {
        stocksOwned: 44.00,
        balance: 400.00,
        success: true,
    }
    return res.status(200).json(response)
}