// import { DumpLogUser } from "../../../clients/DayTraderClient";

export default async function userLog(req, res){
    const user = req.body.username;
    // const response = await DumpLogUser(user, "dumploguser.xml", -1);
    const response = {
        xml: "",
        success: true,
    }
    return res.status(200).json(response)
}