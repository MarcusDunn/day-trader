import { CancelSell } from "../../../../clients/DayTraderClient"

export default async function cancelSell(req, res){
    const username = req.body.username
    // const response = await CancelSell(username, -1);
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}