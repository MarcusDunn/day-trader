import React from 'react'
import StockOptions from '../src/components/dashboard/StockOptions'
import { Container } from '@mui/material'

function stocks() {
    return (
        <main>
            <Container maxWidth="lg" className="my-20">
                <StockOptions />
            </Container>
        </main>
    )
}

export default stocks