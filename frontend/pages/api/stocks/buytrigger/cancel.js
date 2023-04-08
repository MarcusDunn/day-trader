import { CancelSetBuy } from "../../../../clients/DayTraderClient";


export default async function cancelSetBuy(req, res){
    const username = req.body.username;
    const stock_symbol = req.body.stock;
    if(process.env.DUMMY_DATA == "true"){
        const response = {
            success: true,
        }
        return res.status(200).json(response)
    }else{
        const grpcCall = await CancelSetBuy(username, stock_symbol, -1);
        const response = {
            success: true,
        }
        return res.status(200).json(response)
    }
}