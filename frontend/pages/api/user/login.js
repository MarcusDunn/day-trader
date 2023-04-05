import { Login } from "../../../clients/DayTraderClient";


export default async function login(req, res){
    // const response = await Login(req.body.username);
    const response = {
        status: true,
        user: req.body.username
    }
    return res.status(200).json(response)
}