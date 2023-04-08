import { Add } from "../../../clients/DayTraderClient";


export default async function signup(req, res){
    const username = req.body.username;
    if(process.env.DUMMY_DATA == "true"){
        const response = {
            success: true,
            user: username,
        }
        return res.status(200).json(response)
    }else{
        const grpcCall = await Add(username, 0, -1);;
        const response = {
            success: grpcCall.success,
            user: username
        }
        return res.status(200).json(response)
    }
}