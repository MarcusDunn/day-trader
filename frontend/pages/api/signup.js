export default async function signup(req, res){
    const response = {
        status: true,
        user: req.body.username
    }
    return res.status(200).json(response)
}