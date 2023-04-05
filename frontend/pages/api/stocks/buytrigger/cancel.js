// import { CancelSetBuy } from "../../../../clients/DayTraderClient";


export default async function cancelSetBuy(req, res){
    const username = req.body.username;
    const stock_symbol = req.body.stock;
    // const response = await CancelSetBuy(username, stock_symbol, -1);
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}