export default async function buy(req, res){
    console.log("in buy",req.body);
    const response = {
        user: req.body.username,
        shares: 5.2,
        success: true,
    }
    console.log("response",response);
    return res.status(200).json(response)
}