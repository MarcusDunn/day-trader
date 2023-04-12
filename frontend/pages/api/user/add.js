import { Add } from "../clients/DayTraderClient";

export default async function addBalance(req, res){
    const userId = req.body.username;
    const amount = req.body.amount;
    if(process.env.DUMMY_DATA == "true"){
        const response = {
            success: true,
        }
        return res.status(200).json(response)
    }else{
        const grpcCall = await Add(userId, amount, -1);
        const response = {
            success: grpcCall.success,
        }
        return res.status(200).json(response)
    }
}