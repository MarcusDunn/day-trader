export default async function setBuyAmount(req, res){
    const username = req.body.username;
    const stock_symbol = req.body.stock;
    const amount = req.body.stock;
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}