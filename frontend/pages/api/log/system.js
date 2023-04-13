import { DumpLog, GetFile } from "../clients/DayTraderClient";


export default async function dumplog(req, res){
    if(process.env.DUMMY_DATA == "true"){
        const response = {
            xml: "",
            success: true,
        }
        return res.status(200).json(response)
    }else{
        const filename = "dumplog.xml";
        const grpcCall = await DumpLog(filename, -1);
        const grpcFileCall = await GetFile(grpcCall.xml)
        const response = {
            file: grpcFileCall.contents,
            success: true,
        }
        return res.status(200).json(response)
    }
}