export default async function getStocks(req, res){
    // const url="http://localhost:4000/stocks";
    // const options = {
    //     method: 'GET',
    //     headers: {
    //         Accept: 'application/json',
    //         'Content-Type': 'application/json',
    //     },
    // }
    // const response = await (await fetch(url, options)).json();
    const response = {
        "stocks": [
            {
                name: "ABC",
                price: 420.69,
                change: -10.25,
                percentChange: -2.38
            },
            {
                name: "ASH",
                price: 999999.99,
                change: 50,
                percentChange: 0.01
            },
            {
                name: "DFE",
                price: 1337.23,
                change: 42.11,
                percentChange: 3.25
            },
            {
                name: "ZEL",
                price: 5.78,
                change: 0.50,
                percentChange: 9.46
            },
            {
                name: "QUE",
                price: 4512.54,
                change: -18.32,
                percentChange: -0.41
            },
            {
                name: "DFQ",
                price: 6458.34,
                change: 12.30,
                percentChange: 0.27
            },
            {
                name: "XYZ",
                price: 123.45,
                change: 1.23,
                percentChange: 1.01
            },
            {
                name: "GHI",
                price: 987.65,
                change: -32.10,
                percentChange: -3.15
            },
            {
                name: "JKL",
                price: 234.56,
                change: 5.67,
                percentChange: 2.48
            },
            {
                name: "MNO",
                price: 789.01,
                change: -7.89,
                percentChange: -0.99
            },
            {
                name: "PQR",
                price: 456.78,
                change: 0.00,
                percentChange: 0.00
            },
            {
                name: "AAA",
                price: 10.00,
                change: 0.00,
                percentChange: 0.00
            },
            {
                name: "BBB",
                price: 20.00,
                change: -1.00,
                percentChange: -5.00
            },
            {
                name: "CCC",
                price: 30.00,
                change: 2.50,
                percentChange: 8.33
            },
            {
                name: "DDD",
                price: 40.00,
                change: -3.75,
                percentChange: -9.38
            },
            {
                name: "EEE",
                price: 50.00,
                change: 1.25,
                percentChange: 2.50
            }
        ]
    }
      
    return res.status(200).json(response)
}