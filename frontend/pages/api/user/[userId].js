const response = {
    balance: 523.45,
    stock: [
        {
            "name": "ABC",
            "stock": 420.69,
        },
        {
            "name": "ASH",
            "stock": 55.3,
        },
        {
            "name": "DFE",
            "stock": 69.3,
        },
    ],
    SellTriggers: [
        {
            "name": "ABC",
            "triggerAmount": 500.00,
            "sharesToSell": 300.0,
        },
        {
            "name": "ASH",
            "triggerAmount": 1000000.00,
            "sharesToSell": 25.0,
        },
        {
            "name": "DFE",
            "triggerAmount": 1500.00,
            "sharesToSell": 65.0,
        },
    ],
    BuyTriggers: [
        {
            "name": "ABC",
            "triggerAmount": 500.00,
            "buyAmount": 300.0,
        },
        {
            "name": "ASH",
            "triggerAmount": 1000000.00,
            "buyAmount": 25.0,
        },
        {
            "name": "DFE",
            "triggerAmount": 1500.00,
            "buyAmount": 65.0,
        },
    ]
}

export default async function getuser(req, res){
    const userId = req.query.userId;
    return res.status(200).json(response)
}