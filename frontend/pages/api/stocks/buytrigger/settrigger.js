export default async function setBuyTrigger(req, res){
    const response = {
        balance: 99.99,
        triggerAmount: 500.25,
        success: true,
    }
    return res.status(200).json(response)
}