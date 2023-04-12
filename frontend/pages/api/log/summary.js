import { DisplaySummary } from "../../../clients/DayTraderClient";

export default async function userSummary(req, res){
    const user = req.body.username;
    if(process.env.DUMMY_DATA == "true"){
        const response = {
            user_commands: [],
            account_transactions: [],
        }
        return res.status(200).json(response)
    }else{
        console.log(user);
        const grpcCall = await DisplaySummary(user, -1);
        const response = {
            user_commands: grpcCall.userCommands,
            account_transactions: grpcCall.accountTransactions,
        }
        return res.status(200).json(response)
    }
}