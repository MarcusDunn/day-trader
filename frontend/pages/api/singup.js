export default async function login(req, res){
    const response = {
        status: 'ok',
        user: "john",
        balance: "0.0",
        OwnedStock: [],
        UncommitedBuy: [],
        UncommitedSell: []

    }
    return res.status(200).json(response)
}