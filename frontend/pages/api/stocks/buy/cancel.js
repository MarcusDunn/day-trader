import { CancelBuy } from "../../../../clients/DayTraderClient";

export default async function cancelBuy(req, res){
    const username = req.body.username
    if(process.env.DUMMY_DATA == "true"){
        const response = {
            success: true,
        }
        return res.status(200).json(response)
    }else{
        const grpcCall = await CancelBuy(username, -1);
        const response = {
            success: grpcCall.success,
        }
        return res.status(200).json(response)
    }
}