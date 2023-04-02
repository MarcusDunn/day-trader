const stocks = [
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
]

export default async function getOwnedStocks(req, res){
    return res.status(200).json(stocks);
}  