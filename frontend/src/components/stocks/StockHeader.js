import {Box, Button, Paper, Typography} from '@mui/material'
import React from 'react'

function StockHeader({stock}) {
  const backgrounds = ['/background1.jpg', 'background2.jpg', 'background3.jpg'];
  const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    return (
        <Box
            className="w-full h-96"
            sx={{
                background: `linear-gradient( rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7) ), url('${background}')`,
                backgroundPosition: "center",
                backgroundSize: "cover",
            }}
        >
            <div className="text-center pt-20">
                <Typography variant="h3">
                    {stock.name} 
                </Typography>
                <Typography
                  variant="h5"
                  className={ stock.percentChange > 0 ? "text-green-500" : "text-red-500"}
                >
                  {stock.percentChange > 0 ? "+" : null}{stock.percentChange}%
                </Typography>
            </div>
        </Box>
    )
}

export default StockHeader
