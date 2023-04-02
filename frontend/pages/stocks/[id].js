import { Button, Container, Typography } from '@mui/material'
import React from 'react'
import StockHeader from '../../src/components/stocks/StockHeader'
import SingleStockBody from '../../src/components/stocks/SingleStockBody'

function stock({ stock }) {
    console.log("stock",stock)
    return (
        stock.name !== "NOTFOUND" ? 
            <main>
                <StockHeader stock={stock} />
                <Container maxWidth="md" className="my-20">
                    <SingleStockBody stock={stock} />
                </Container>
            </main>
        :
            <main>
                <Container maxWidth="md" className="my-20 text-center">
                    <Typography
                        variant="h2"
                        gutterBottom
                    >
                        Stock not found
                    </Typography>
                    <Button variant="outlined" href="/stocks">
                        Stocks
                    </Button>
                </Container>
            </main>

    )
}

export async function getServerSideProps({ query }) {
    const { id } = query
    const url = process.env.FRONTEND_URL ? process.env.FRONTEND_URL : "http://localhost:3000/"
    try{
        const res = await fetch(url.concat("api/stocks/",id));
        const data = await res.json()
        return { props: { stock: data } }
    }catch(error){
        console.log("error",error);
        return { props: {stock: {name: "NOTFOUND"}}}
    }
}

export default stock