export default async function setSellAmount(req, res){
    const response = {
        currentStockPrice: 99.99,
        numSharesToSell: 5.5,
        success: true,
    }
    return res.status(200).json(response)
}