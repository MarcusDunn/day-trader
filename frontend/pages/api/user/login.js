import { Login } from "../../../clients/DayTraderClient";


export default async function login(req, res){
    if(process.env.DUMMY_DATA == "true"){
        const response = {
            success: true,
            user: req.body.username
        }
        return res.status(200).json(response)
    }else{
        const grpcCall = await Login(req.body.username);
        const response = {
            success: grpcCall.success,
            user: grpcCall.userId,
        }
        return res.status(200).json(response)
    }
}