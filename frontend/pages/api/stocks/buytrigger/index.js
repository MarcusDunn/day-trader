export default async function setBuyAmount(req, res){
    const response = {
        balance: 99.99,
        buyAmount: 5.5,
        success: true,
    }
    return res.status(200).json(response)
}