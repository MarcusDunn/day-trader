export default async function signup(req, res){
    const response = {
        status: true,
        user: req.body.username
    }
    // do an add with 0 amount
    return res.status(200).json(response)
}