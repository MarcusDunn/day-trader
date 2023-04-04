export default async function cancelSell(req, res){
    const response = {
        success: true,
    }
    return res.status(200).json(response)
}