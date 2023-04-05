import { CommitBuy } from "../../../../clients/DayTraderClient";


export default async function commitBuy(req, res){
    const username = req.body.username
    // const response = await CommitBuy(username, -1);
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}