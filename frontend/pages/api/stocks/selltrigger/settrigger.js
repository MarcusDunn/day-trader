export default async function setSellTrigger(req, res){
    const username = req.body.username;
    const stock_symbol = req.body.stock;
    const amount = req.body.amount;
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}