import { Container } from '@mui/material'
import React from 'react'
import StockOptions from '../src/components/dashboard/StockOptions'

function dashboard() {
    return (
        <main>
            <Container maxWidth="md" className="my-20">
                <StockOptions />
            </Container>
        </main>
    )
}

export default dashboard