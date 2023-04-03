import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'

function getSellTrigger(stock, userInfo){
  if(!userInfo.SellTriggers){
    return {}
  }
  for(const trigger of userInfo.SellTriggers){
    if(trigger.name == stock.name){
      return trigger;
    }
  }
  return {}
}
function getBuyTrigger(stock, userInfo){
  if(!userInfo.BuyTriggers){
    return {}
  }
  for(const trigger of userInfo.BuyTriggers){
    if(trigger.name == stock.name){
      return trigger;
    }
  }
  return {}
}
function getOwnedStock(stock, userInfo){
  if(!userInfo.stock){
    return {}
  }
  for(const stock of userInfo.stock){
    if(stock.name == stock.name){
      return stock;
    }
  }
  return {}
}

function SingleStockBody({ stock, userInfo }) {
  const [ownedStock, setOwnedStock] = useState({});
  const [sellTrigger, setSellTrigger] = useState({});
  const [buyTrigger, setBuyTrigger] = useState({});
  
  useEffect(()=>{
    setSellTrigger(getSellTrigger(stock, userInfo))
    setBuyTrigger(getBuyTrigger(stock, userInfo))
    setOwnedStock(getOwnedStock(stock, userInfo))
  }, [userInfo] )

  const StockInfo = (title, subtitle, value, button) => {
    return(
      <Box className="text-center flex flex-col justify-between">
        <div>
          <Typography variant="h4" align='center'>
            {title}
          </Typography>
          <Typography variant="p" align='center' color="secondary" gutterBottom>
            {subtitle}
          </Typography>
        </div>
        <div>
          <Typography variant="h6" className="mt-6" align='center' gutterBottom>
            {value}
          </Typography>
          {button}
        </div>
      </Box>
    )
  }

  const OwnedStockJSX = () => {
      const subtitle = ownedStock.stock ? `$${(ownedStock.stock*stock.price).toFixed(2)} of ${stock.name}` : "No stock owned"
      const value = ownedStock.stock ? `${ownedStock.stock} Shares` : ""
      const button = <Button variant="outlined" primary="outlined">Trade {stock.name}</Button>
      return StockInfo("Owned Shares", subtitle, value, button)
  }
  
  const BuyTriggerJSX = () => {
      const subtitle = buyTrigger.triggerAmount ? `Buying at $${buyTrigger.triggerAmount.toFixed(2)}` : "No owned buy triggers"
      const value = buyTrigger.triggerAmount ? `${buyTrigger.buyAmount.toFixed(2)} shares` : ""
      const button = <Button variant="outlined" primary="outlined">Buy Triggers</Button>
      return StockInfo("Buy Triggers", subtitle, value, button)
  }
  
  
  const SellTriggerJSX = () => {
      const subtitle = sellTrigger.triggerAmount ? `Selling at $${sellTrigger.triggerAmount.toFixed(2)}` : "No owned sell triggers"
      const value = sellTrigger.triggerAmount ? `${sellTrigger.sharesToSell.toFixed(2)} shares` : ""
      const button = <Button variant="outlined" primary="outlined">Sell Triggers</Button>
      return StockInfo("Sell Triggers", subtitle, value, button)
  }
  
  return (
    <div className="flex flex-row justify-between flex-wrap">
      <OwnedStockJSX />
      <Divider orientation="vertical" flexItem />
      <SellTriggerJSX />
      <Divider orientation="vertical" flexItem />
      <BuyTriggerJSX />
    </div>
  )
}

export default SingleStockBody