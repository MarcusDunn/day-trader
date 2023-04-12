import { Box, Button, Dialog, Divider, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react'
import TradeModal from './TradeModal';
import SellTriggerModal from './SellTriggerModal';
import BuyTriggerModal from './BuyTriggerModal';
import { UserContext } from '../../../pages/_app';

function getSellTrigger(stock, userInfo){
  if(!userInfo.SellTriggers){
    return {}
  }
  for(const trigger of userInfo.SellTriggers){
    if(trigger.stock == stock.name){
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
    console.log("Buy trigger:",trigger)
    if(trigger.stock == stock.name){
      return trigger;
    }
  }
  return {}
}
function getOwnedStock(stock, userInfo){
  if(!userInfo.stock){
    return {}
  }
  for(const ownedStock of userInfo.stock){
    if(stock.name == ownedStock.name){
      console.log(stock);
      return ownedStock;
    }
  }
  return {}
}

function SingleStockBody({ stock }) {
  const user = useContext(UserContext).user;
  const [userInfo, setUserInfo] = useState({});
  const [ownedStock, setOwnedStock] = useState({});
  const [sellTrigger, setSellTrigger] = useState({});
  const [buyTrigger, setBuyTrigger] = useState({});
  const [openTradeModal, setOpenTradeModal] = useState(false);
  const [openSellTriggerModal, setOpenSellTriggerModal] = useState(false);
  const [openBuyTriggerModal, setOpenBuyTriggerModal] = useState(false);

  const getUpdatedUser = async () => {
    if (!user) {
      return;
    }
    const url = '/api/user/'.concat(user);
    try {
      const response_parsed = await (await fetch(url)).json();
      setUserInfo(response_parsed);
      console.log("Got updated user",response_parsed)
    } catch (error) {
        console.log(error);
      }
  };

  const handleOpenTradeModal = () => {
    setOpenTradeModal(true);
  };

  const handleCloseModal = () => {
    setOpenTradeModal(false);
    getUpdatedUser();
  };

  const handleOpenSellTriggerModal = () => {
    setOpenSellTriggerModal(true);
  };

  const handleCloseSellTriggerModal = () => {
    setOpenSellTriggerModal(false);
    getUpdatedUser();
  };
  const handleOpenBuyTriggerModal = () => {
    setOpenBuyTriggerModal(true);
  };

  const handleCloseBuyTriggerModal = () => {
    setOpenBuyTriggerModal(false);
    getUpdatedUser();
  };
  
  useEffect(()=>{
    setSellTrigger(getSellTrigger(stock, userInfo))
    setBuyTrigger(getBuyTrigger(stock, userInfo))
    setOwnedStock(getOwnedStock(stock, userInfo))
  }, [userInfo] )

  useEffect(()=>{
    getUpdatedUser();
  }, [] )

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
      const value = ownedStock.stock ? `${ownedStock.stock.toFixed(2)} Shares` : ""
      const button = (
        <Button variant="outlined" primary="outlined" onClick={handleOpenTradeModal}>
          Trade {stock.name}
        </Button>
      );
      return StockInfo("Owned Shares", subtitle, value, button)
  }
  
  const BuyTriggerJSX = () => {
      const subtitle = buyTrigger.triggerAmount ? `Buying at $${buyTrigger.triggerAmount.toFixed(2)}` : "No owned buy triggers"
      const value = buyTrigger.triggerAmount ? `$${buyTrigger.buyAmount.toFixed(2)} of shares` : ""
      const button = <Button variant="outlined" primary="outlined" onClick={handleOpenBuyTriggerModal}>Buy Triggers</Button>
      return StockInfo("Buy Triggers", subtitle, value, button)
  }
  
  
  const SellTriggerJSX = () => {
      const subtitle = sellTrigger.triggerAmount ? `Selling at $${sellTrigger.triggerAmount.toFixed(2)}` : "No owned sell triggers"
      const value = sellTrigger.triggerAmount ? `${sellTrigger.sharesToSell.toFixed(2)} shares` : ""
      const button = <Button variant="outlined" primary="outlined" onClick={handleOpenSellTriggerModal} disabled={!ownedStock.stock}>Sell Triggers</Button>
      return StockInfo("Sell Triggers", subtitle, value, button)
  }
  
  return (
    <div className="flex flex-row justify-between flex-wrap">
      <OwnedStockJSX />
      <Divider orientation="vertical" flexItem />
      <SellTriggerJSX />
      <Divider orientation="vertical" flexItem />
      <BuyTriggerJSX />
      <Dialog
        open={openTradeModal}
        onClose={handleCloseModal}
      >
        <TradeModal stock={stock} userInfo={userInfo} ownedStock={ownedStock} handleClose={handleCloseModal} />
      </Dialog>
      <Dialog
        open={openSellTriggerModal}
        onClose={handleCloseSellTriggerModal}
      >
        <SellTriggerModal stock={stock} userInfo={userInfo} handleClose={handleCloseSellTriggerModal} trigger={sellTrigger} />
      </Dialog>
      <Dialog
        open={openBuyTriggerModal}
        onClose={handleCloseBuyTriggerModal}
      >
        <BuyTriggerModal stock={stock} userInfo={userInfo} handleClose={handleCloseBuyTriggerModal} trigger={buyTrigger}/>
      </Dialog>
    </div>
  )
}

export default SingleStockBody