export default async function cancelBuy(req, res){
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}