import { Add } from "../../../clients/DayTraderClient";


export default async function addBalance(req, res){
    const userId = req.body.username;
    const amount = req.body.amount;
    const response = await Add(userId, amount, -1);
    // const response = {
    //     success: true,
    // }
    return res.status(200).json(response)
}