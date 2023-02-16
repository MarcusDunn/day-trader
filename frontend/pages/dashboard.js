import { Container } from '@mui/material'
import React from 'react'
import StockOptions from '../src/components/dashboard/StockOptions'
import StockOptions2 from '../src/components/dashboard/StockOptions2'

function dashboard() {
    return (
        <main>
            <Container maxWidth="md" className="my-20">
                <StockOptions2 />
            </Container>
        </main>
    )
}

export default dashboard