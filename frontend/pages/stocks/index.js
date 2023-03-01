import { Container } from '@mui/material'
import React from 'react'
import StockOptions from '../../src/components/dashboard/StockOptions'

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