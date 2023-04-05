import { CommitSell } from "../../../../clients/DayTraderClient";


export default async function commitSell(req, res){
    const username = req.body.username;
    // const response = await CommitSell(username, -1);
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}