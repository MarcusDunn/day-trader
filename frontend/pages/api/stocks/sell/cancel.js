import { CancelSell } from "../../../../clients/DayTraderClient";


export default async function cancelSell(req, res){
    const username = req.body.username
    if(process.env.DUMMY_DATA == "true"){
        const response = {
            success: true,
        }
        return res.status(200).json(response)
    }else{
        const grpcCall = await CancelSell(username, -1);
        const response = {
            success: grpcCall.success,
        }
        return res.status(200).json(response)
    }
}