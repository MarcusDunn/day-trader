export default async function cancelSell(req, res){
    const username = req.body.username
    const request_num = req.body.request_num
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}