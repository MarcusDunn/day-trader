import { DumpLog } from "../clients/DayTraderClient";


export default async function dumplog(req, res){
    if(process.env.DUMMY_DATA == "true"){
        const response = {
            xml: "",
            success: true,
        }
        return res.status(200).json(response)
    }else{
        const grpcCall = await DumpLog("dumplog.xml", -1);
        const response = {
            xml: grpcCall.xml,
            success: true,
        }
        return res.status(200).json(response)
    }
}