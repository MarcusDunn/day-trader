import { Add } from "../../../clients/DayTraderClient";

export default async function signup(req, res){
    const username = req.body.username;
    // const response = await Add(username, 0, -1);
    const response = {
        status: true,
        user: req.body.username
    }
    // do an add with 0 amount
    return res.status(200).json(response)
}