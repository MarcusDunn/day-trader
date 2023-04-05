export default async function addBalance(req, res){
    const userId = req.body.username;
    const amount = req.body.amount;
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}