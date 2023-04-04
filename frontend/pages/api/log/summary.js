export default async function userSummary(req, res){
    const user = req.body.username;
    response = {
        xml: "",
        success: true,
    }
    return res.status(200).json(response)
}