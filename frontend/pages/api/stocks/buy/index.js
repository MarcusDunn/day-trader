// import { Buy } from "../../../../clients/DayTraderClient";

export default async function buy(req, res){
    const username = req.body.username
    const stock = req.body.stock
    const amount = req.body.amount
    // const response = await Buy(username, stock, amount, -1);
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}