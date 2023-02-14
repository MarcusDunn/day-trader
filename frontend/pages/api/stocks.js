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
        status: 'ok',
        user: "ajslkdfjkleasfehhgfbtre34asg"
    }
    return res.status(200).json(response)
}