export default async function buy(req, res){
    const response = {
        user: req.body.username,
        shares: 5.2,
        success: true,
    }
    return res.status(200).json(response)
}