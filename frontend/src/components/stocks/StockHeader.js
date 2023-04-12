import { Box, Typography, useTheme } from '@mui/material'
import React from 'react'

function StockHeader({stock}) {
  const theme = useTheme();

  return (
    <Box
      className="w-full h-96"
      sx={{
        backgroundImage: `linear-gradient(black, ${theme.palette.primary.dark})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="text-center pt-20">
        <Typography variant="h2">{stock.name}</Typography>
        <Typography variant="h6" className={stock.change > 0 ? "text-green-500" : "text-red-500"}>
          ${stock.change.toFixed(2)} ~ {stock.change > 0 ? "+" : "-"}{stock.percentChange.toFixed(2)}%
        </Typography>
        <Typography variant="h5">${stock.price}</Typography>
      </div>
    </Box>
  )
}

export default StockHeader
