// import { DumpLog } from "../../../clients/DayTraderClient";


export default async function dumplog(req, res){
    // const response = await DumpLog("dumplog.xml", -1);
    const response = {
        xml: "",
        success: true,
    }
    return res.status(200).json(response)
}