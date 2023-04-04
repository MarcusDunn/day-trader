export default async function sell(req, res){
    const response = {
        user: req.body.username,
        shares: 5.2,
        success: true,
    }
    return res.status(200).json(response)
}