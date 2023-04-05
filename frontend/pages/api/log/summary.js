// import { DisplaySummary } from "../../../clients/DayTraderClient";

export default async function userSummary(req, res){
    const user = req.body.username;
    // const response = await DisplaySummary(user, -1);
    const response = {
        user_commands: [],
        account_transactions: [],
    }
    return res.status(200).json(response)
}