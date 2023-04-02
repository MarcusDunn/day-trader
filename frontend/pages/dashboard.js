import { Container } from '@mui/material'
import React from 'react'
import StockOptions from '../src/components/dashboard/StockOptions'
import Balance from '../src/components/dashboard/Balance'
import OwnedStocks from '../src/components/dashboard/OwnedStocks'

function dashboard() {
    return (
        <main>
            <Container maxWidth="lg" className="my-20">
                <div className="flex flew-row flex-wrap w-full justify-between">
                    <div className="w-3/4">
                        <OwnedStocks />
                    </div>
                    <div className="w-1/5">
                        <Balance />
                    </div>
                </div>
            </Container>
        </main>
    )
}

export default dashboard