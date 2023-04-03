import React from 'react'
import { Box, Button, Typography } from '@mui/material';

function BuySellStockMenu({ stock, userInfo }) {
    return (
        <div className="flex flex-row justify-evenly flex-wrap">
            <Box className="p-4 text-center mx-8">
                <Typography variant="h4">
                    Trade Stock
                </Typography>
                <Typography variant="subtitle2" className="mb-8" color="secondary">
                    Buy and Sell {stock.name}
                </Typography>
                <Button variant="outlined">
                    Trade {stock.name}
                </Button>
            </Box>
            <Box className="p-4 text-center mx-8">
                <Typography variant="h4">
                    Set Triggers
                </Typography>
                <Typography variant="subtitle2" className="mb-8" color="secondary">
                    Manage Buy and Sell Triggers on {stock.name}
                </Typography>
                <Button variant="outlined">
                    {stock.name} Triggers
                </Button>
            </Box>
        </div>
    )
}

export default BuySellStockMenu