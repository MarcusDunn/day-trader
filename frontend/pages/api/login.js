export default async function login(req, res){
    // const url="http://localhost:4000/login";
    // body = {
    //     email: req.body.email,
    //     password: req.body.password,
    // }
    // const options = {
    //     method: 'POST',
    //     headers: {
    //         Accept: 'application/json',
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(body)
    // }
    
    // const response = await (await fetch(url, options)).json();
    const response = {
        status: 'ok',
        user: "john",
        balance: "69.42",
        OwnedStock: [],
        UncommitedBuy: [],
        UncommitedSell: []

    }
    return res.status(200).json(response)
}