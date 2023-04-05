export default async function sell(req, res){
    const username = req.body.username
    const stock = req.body.stock
    const request_num = req.body.request_num
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}