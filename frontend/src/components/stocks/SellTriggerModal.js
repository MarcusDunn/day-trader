import {
  Button,
  TextField,
  Typography,
  FormControl,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../pages/_app";
import DeleteIcon from '@mui/icons-material/Delete';

function getOwnedStock(stock, userInfo){
  if(!userInfo.stock){
    return {}
  }
  for(const ownedStock of userInfo.stock){
    if(stock.name == ownedStock.name){
      console.log(ownedStock);
      return ownedStock;
    }
  }
  return {}
}

function SellTriggerModal({ stock, userInfo, handleClose, trigger }) {
  const user = useContext(UserContext).user;
  const [amount, setAmount] = useState({});
  const [stockOwned, setStockOwned] = useState(0.0);
  const [triggerVal, setTriggerVal] = useState(0.0);
  const [actionResponse, setActionResponse] = useState({});
  const [readyToCommit, setReadyToCommit] = useState(false);
  const [error, setError] = useState("");

  if (!stock || !userInfo || !user) {
    return <></>;
  }

  useEffect(() => {
    setStockOwned(getOwnedStock(stock, userInfo));
  }, [stock, userInfo]);

  useEffect(()=> {
    if(trigger.sharesToSell){
      setAmount(trigger.sharesToSell)
      setTriggerVal(trigger.triggerAmount)
    }
  }, [trigger])


  const executeAction = async () => {
    const url = `/api/stocks/selltrigger`;
    const body = {
      username: user,
      stock: stock.name,
      amount: amount,
    };
    const fetchArgs = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
    try {
      const response_parsed = await (await fetch(url, fetchArgs)).json();
      console.log("response_parsed", response_parsed);
      if (response_parsed.success == true) {
        setReadyToCommit(true);
        setActionResponse(response_parsed);
      } else {
        setError(
          `Unsuccessful Set Sell Amount Attempt`
        );
      }
    } catch (error) {
      console.log(error);
      setError(
        `Unsuccessful Set Sell Amount Attempt`
      );
    }
  };

  const CommitActionTrigger = async () => {
    const url = `/api/stocks/selltrigger/settrigger`;
    const body = {
      username: user,
      stock: stock.name,
      amount: triggerVal,
    };
    const fetchArgs = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
    try {
      const response_parsed = await (await fetch(url, fetchArgs)).json();
      console.log(response_parsed);
      if (response_parsed.success == true) {
        handleClose();
      } else {
        setError(
          `Unsuccessful Commit Sell Trigger Attempt`
        );
      }
    } catch (error) {
      console.log(error);
      setError(
        `Unsuccessful Commit Sell Trigger Attempt`
      );
    }
  };

  const CancelAction = async () => {
    const url = `/api/stocks/selltrigger/cancel`;
    const body = {
      username: user,
      stock: stock.name,
    };
    const fetchArgs = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
    try {
      const response_parsed = await (await fetch(url, fetchArgs)).json();
      if (response_parsed.success == true) {
        handleClose(false);
      } else {
        setError(
          `Unsuccessful Delete Trigger Attempt`
        );
      }
    } catch (error) {
      console.log(error);
      setError(
        `Unsuccessful Delete Trigger Attempt`
      );
    }
  };

  const handleAmountChange = (event) => {
    let maximumValAloud = stockOwned.stock
    if(trigger.sharesToSell){
      maximumValAloud = maximumValAloud + trigger.sharesToSell
    }
    setAmount(Number(event.target.value) < maximumValAloud ? Number(event.target.value) : maximumValAloud );
  };
  const handleTriggerValChange = (event) => {
    setTriggerVal(Number(event.target.value));
  };

  return (
    <div className="p-4" >
      {readyToCommit ? (
        <div>
          <DialogContent sx={{width: 450}}>
            <Typography variant="h5" className="mb-6">
              Set Sell Trigger
            </Typography>
            <TextField
                type="number"
                inputProps={{}}
                label="Trigger Amount ($)"
                value={triggerVal}
                onChange={handleTriggerValChange}
                fullWidth
            />
            <Typography
              variant="subtitle2"
              display={"block"}
              color="error"
              gutterBottom
            >
              {error}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              className="mr-4"
              variant="outlined"
              color="primary"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className="mr-4"
              variant="outlined"
              color="secondary"
              onClick={CommitActionTrigger}
            >
              Set Sell Trigger
            </Button>
          </DialogActions>
        </div>
      ) : (
        <div>
          <DialogContent sx={{width: 450}}>
            <Typography variant="h5" className="mb-6">
              Set Shares to Sell on Trigger - {stock.name}
            </Typography>
            <FormControl className="w-full">
              <TextField
                type="number"
                label="Set Amount of Shares to Sell"
                value={amount}
                onChange={handleAmountChange}
                fullWidth
              />
            </FormControl>
            <Typography
              variant="subtitle2"
              display={"block"}
              color="secondary"
              className="mt-3 ml-2"
              gutterBottom
            >
             Shares Owned: {stockOwned.stock ? stockOwned.stock.toFixed(2) : 0.00}
            </Typography>

            <Typography
              variant="subtitle2"
              display={"block"}
              color="error"
              gutterBottom
            >
              {error}
            </Typography>
          </DialogContent>
          <DialogActions className="flex flex-row justify-between">
            <div>
              <IconButton className={!trigger.sharesToSell ? "hidden" : ""} onClick={CancelAction} disabled={!trigger.sharesToSell}>
                <Tooltip title="Delete Sell Trigger">
                  <DeleteIcon />
                </Tooltip>
              </IconButton>
            </div>
            <div>
              <Button
                className="mr-4"
                variant="outlined"
                color="primary"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="mr-4"
                variant="outlined"
                color="secondary"
                onClick={executeAction}
                disabled={amount <= 0.0}
              >
                Set Sell Amount
              </Button>
            </div>
          </DialogActions>
        </div>
      )}
    </div>
  );
}

export default SellTriggerModal;
