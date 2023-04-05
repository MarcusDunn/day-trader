export default async function userSummary(req, res){
    const user = req.body.username;
    response = {
        user_commands: [],
        account_transactions: [],
    }
    return res.status(200).json(response)
}