import { CommitBuy } from "../../../../clients/DayTraderClient";


export default async function commitBuy(req, res){
    const username = req.body.username
    if(process.env.DUMMY_DATA == "true"){
        const response = {
            success: true,
        }
        return res.status(200).json(response)
    }else{
        const grpcCall = await CommitBuy(username, -1);
        const response = {
            success: grpcCall.success,
        }
        return res.status(200).json(response)
    }
}