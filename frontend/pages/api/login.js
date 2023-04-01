export default async function login(req, res){
    console.log("req.body.username",req.body.username);

    const response = {
        status: true,
        user: req.body.username
    }
    return res.status(200).json(response)
}