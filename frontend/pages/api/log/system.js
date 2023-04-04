export default async function dumplog(req, res){
    response = {
        xml: "",
        success: true,
    }
    return res.status(200).json(response)
}