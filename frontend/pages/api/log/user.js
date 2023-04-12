import { DumpLogUser } from "../clients/DayTraderClient";

export default async function userLog(req, res){
    const user = req.body.username;
    if(process.env.DUMMY_DATA == "true"){
        const response = {
            xml: "",
            success: true,
        }
        return res.status(200).json(response)
    }else{
        const grpcCall = await DumpLogUser(user, "dumploguser.xml", -1);
        const response = {
            xml: grpcCall.xml,
            success: true,
        }
        return res.status(200).json(response)
    }
}