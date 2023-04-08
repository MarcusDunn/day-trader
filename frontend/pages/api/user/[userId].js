import { GetUserInfo } from "../../../clients/DayTraderClient";

const dummy_data = {
    balance: 523.45,
    stock: [
        {
            "name": "ABC",
            "stock": 55.51,
        },
        {
            "name": "ASH",
            "stock": 55.3,
        },
        {
            "name": "DFE",
            "stock": 51.3,
        },
    ],
    SellTriggers: [
        {
            "name": "ABC",
            "triggerAmount": 500.00,
            "sharesToSell": 22.0,
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
            "buyAmount": 22.0,
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
    if(process.env.DUMMY_DATA == "true"){
        return res.status(200).json(dummy_data)
    }else{
        const grpcCall = await GetUserInfo(userId);
        console.log(grpcCall);
        const response = {
            balance: grpcCall.balance,
            stock: grpcCall.stock,
            SellTriggers: grpcCall.SellTriggers,
            BuyTriggers: grpcCall.BuyTriggers,
        }
        return res.status(200).json(response)
    }
}