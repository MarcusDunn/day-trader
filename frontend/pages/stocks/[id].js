import { Container, Typography } from '@mui/material'
import React from 'react'
import StockHeader from '../../src/components/stocks/StockHeader'
import SingleStockBody from '../../src/components/stocks/SingleStockBody'

function stock({ stock }) {
    return (
        <main>
            <StockHeader stock={stock} />
            <Container maxWidth="md" className="my-20">
                <SingleStockBody stock={stock} />
            </Container>
        </main>
    )
}

export async function getServerSideProps({ query }) {
    const { id } = query
    try{
        const res = await fetch(`/api/stocks/`.concat(id));
        const data = await res.json()
        return { props: { stock: data } }
    }catch(error){
        return { props: {stock: {name: "NOTFOUND"}}}
    }
}

export default stock