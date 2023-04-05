import { Container, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import StockOptions from '../src/components/dashboard/StockOptions'
import Balance from '../src/components/dashboard/Balance'
import OwnedStocks from '../src/components/dashboard/OwnedStocks'
import SellTriggers from '../src/components/dashboard/SellTriggers'
import BuyTriggers from '../src/components/dashboard/BuyTriggers'

function dashboard() {
    const theme = useTheme();
    const isMediumOrBelow = useMediaQuery(theme.breakpoints.down("md"));
    return (
        <main>
            <Container maxWidth="lg" className="my-20">
                <div className={isMediumOrBelow ? "my-4" : "flex flew-row flex-wrap w-full justify-between my-4"}>
                    <div className={isMediumOrBelow ? "my-4 m-auto" : "w-1/3 p-2"}>
                        <Balance />
                    </div>
                    <div className={isMediumOrBelow ? "my-4" : "w-2/3 p-2"}>
                        <OwnedStocks />
                    </div>
                </div>
                <div className={isMediumOrBelow ? "my-4" : "flex flew-row flex-wrap w-full justify-between my-4"}>
                    <div className={isMediumOrBelow ? "my-4" : "w-1/2 p-2"}>
                        <BuyTriggers />
                    </div>
                    <div className={isMediumOrBelow ? "my-4" : "w-1/2 p-2"}>
                        <SellTriggers />
                    </div>
                </div>
                <div className={isMediumOrBelow ? "my-4" : "my-4 p-2"}>
                    <StockOptions />
                </div>
            </Container>
        </main>
    )
}

export default dashboard