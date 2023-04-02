import { Container } from '@mui/material'
import React from 'react'
import StockOptions from '../src/components/dashboard/StockOptions'
import Balance from '../src/components/dashboard/Balance'
import OwnedStocks from '../src/components/dashboard/OwnedStocks'
import SellTriggers from '../src/components/dashboard/SellTriggers'
import BuyTriggers from '../src/components/dashboard/BuyTriggers'

function dashboard() {
    return (
        <main>
            <Container maxWidth="lg" className="my-20">
                <div className="flex flew-row flex-wrap w-full justify-between">
                    <div className="w-1/3 p-2">
                        <Balance />
                    </div>
                    <div className="w-2/3 p-2">
                        <OwnedStocks />
                    </div>
                </div>
                <div className="flex flew-row flex-wrap w-full justify-between">
                    <div className="w-1/2 p-2">
                        <BuyTriggers />
                    </div>
                    <div className="w-1/2 p-2">
                        <SellTriggers />
                    </div>
                </div>
                <div className="my-4">
                    <StockOptions />
                </div>
            </Container>
        </main>
    )
}

export default dashboard