import { DumpLogUser, GetFile } from "../clients/DayTraderClient";

export default async function userLog(req, res){
    const user = req.body.username;
    if(process.env.DUMMY_DATA == "true"){
        const response = {
            xml: "",
            success: true,
        }
        return res.status(200).json(response)
    }else{
        const filename = "dumploguser.xml";
        const grpcCall = await DumpLogUser(user, filename, -1);
        const grpcFileCall = await GetFile(grpcCall.xml)
        const response = {
            file: grpcFileCall.contents,
            success: true,
        }
        return res.status(200).json(response)
    }
}