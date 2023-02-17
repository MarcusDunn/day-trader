import { Container } from '@mui/material'
import React from 'react'
import StockHeader from '../../src/components/stocks/StockHeader'

function stock({ stock }) {
    return (
        <main>
            <StockHeader stock={stock} />
            <Container maxWidth="md" className="my-20">
            </Container>
        </main>
    )
}

export async function getServerSideProps({ query }) {
    const { id } = query
    try{
        const res = await fetch(`http://localhost:3000/api/stocks/`.concat(id));
        const data = await res.json()
        return { props: { stock: data } }
    }catch(error){
        return { props: {stock: {name: "NOTFOUND"}}}
    }
}

export default stock