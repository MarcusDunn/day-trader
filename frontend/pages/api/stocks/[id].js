// import { Quote } from "../../../clients/DayTraderClient";

const stocks = {
    "ABC": {
        "name": "ABC",
        "price": 432.59,
        "change": -10.25,
        "percentChange": -2.38
    },
    "ASH": {
        "name": "ASH",
        "price": 999999.99,
        "change": 50,
        "percentChange": 0.01
    },
    "DFE": {
        "name": "DFE",
        "price": 1337.23,
        "change": 42.11,
        "percentChange": 3.25
    },
    "ZEL": {
        "name": "ZEL",
        "price": 5.78,
        "change": 0.50,
        "percentChange": 9.46
    },
    "QUE": {
        "name": "QUE",
        "price": 4512.54,
        "change": -18.32,
        "percentChange": -0.41
    },
    "DFQ": {
        "name": "DFQ",
        "price": 6458.34,
        "change": 12.30,
        "percentChange": 0.27
    },
    "XYZ": {
        "name": "XYZ",
        "price": 123.45,
        "change": 1.23,
        "percentChange": 1.01
    },
    "GHI": {
        "name": "GHI",
        "price": 987.65,
        "change": -32.10,
        "percentChange": -3.15
    },
    "JKL": {
        "name": "JKL",
        "price": 234.56,
        "change": 5.67,
        "percentChange": 2.48
    },
    "MNO": {
        "name": "MNO",
        "price": 789.01,
        "change": -7.89,
        "percentChange": -0.99
    },
    "PQR": {
        "name": "PQR",
        "price": 456.78,
        "change": 0.00,
        "percentChange": 0.00
    },
    "AAA": {
        "name": "AAA",
        "price": 10.00,
        "change": 0.00,
        "percentChange": 0.00
    },
    "BBB": {
        "name": "BBB",
        "price": 20.00,
        "change": -1.00,
        "percentChange": -5.00
    },
    "CCC": {
        "name": "CCC",
        "price": 30.00,
        "change": 2.50,
        "percentChange": 8.33
    },
    "DDD": {
        "name": "DDD",
        "price": 40.00,
        "change": -3.75,
        "percentChange": -9.38
    },
    "EEE": {
        "name": "EEE",
        "price": 50.00,
        "change": 1.25,
        "percentChange": 2.50
    }
}

export default async function getStocks(req, res){
    const username = req.body.username;
    const stock = req.query.id.toUpperCase()
    const response = stocks[id] ? stocks[id] : {name: "NOTFOUND"}
    // const stock = req.query.id.toLowerCase()
    // const response = await Quote(username, stock, -1);
    return res.status(200).json(response)
}