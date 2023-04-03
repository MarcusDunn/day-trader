export default async function buy(req, res){
    const response = {
        user: req.body.username,
        shares: req.body.shares,
        success: true,
    }
    return res.status(200).json(response)
}