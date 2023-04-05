import { CancelBuy } from "../../../../clients/DayTraderClient";

export default async function cancelBuy(req, res){
    const username = req.body.username
    const response = await CancelBuy(username, -1);
    // const response = {
    //     success: true,
    // }
    return res.status(200).json(response)
}