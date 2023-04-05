import { SetSellAmount } from "../../../../clients/DayTraderClient";


export default async function setSellAmount(req, res){
    const username = req.body.username;
    const stock_symbol = req.body.stock;
    const amount = req.body.stock;
    // const response = await SetSellAmount(username, stock_symbol, amount, -1);
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}