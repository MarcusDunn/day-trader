import { CancelSetSell } from "../../../../clients/DayTraderClient";


export default async function cancelSellTrigger(req, res){
    const username = req.body.username;
    const stock_symbol = req.body.stock;
    // const response = await CancelSetSell(username, stock_symbol, -1);
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}