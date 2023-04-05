import {
  Button,
  TextField,
  Typography,
  FormControl,
  DialogContent,
  DialogActions,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../pages/_app";

function BuyTriggerModal({ stock, userInfo, handleClose, trigger }) {
  const user = useContext(UserContext).user;
  const [amount, setAmount] = useState(0.0);
  const [triggerVal, setTriggerVal] = useState(0.0);
  const [actionResponse, setActionResponse] = useState({});
  const [readyToCommit, setReadyToCommit] = useState(false);
  const [error, setError] = useState("");

  if (!stock || !userInfo || !user) {
    return <></>;
  }

  useEffect(()=> {
    if(trigger){
      setAmount(trigger.buyAmount)
      setTriggerVal(trigger.triggerAmount)
    }
  }, [trigger])


  const executeAction = async () => {
    const url = `/api/stocks/buytrigger`;
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
          `Unsuccessful Set Buy Amount Attempt`
        );
      }
    } catch (error) {
      console.log(error);
      setError(
        `Unsuccessful Set Buy Amount Attempt`
      );
    }
  };

  const CommitActionTrigger = async () => {
    const url = `/api/stocks/buytrigger/settrigger`;
    const body = {
      username: userInfo.username,
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
          `Unsuccessful Commit Buy Trigger Attempt`
        );
      }
    } catch (error) {
      console.log(error);
      setError(
        `Unsuccessful Commit Buy Trigger Attempt`
      );
    }
  };

  const CancelAction = async () => {
    const url = `/api/stocks/buytrigger/cancel`;
    const body = {
      username: userInfo.username,
      stock_symbol: stock.name,
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
        setReadyToCommit(false);
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
    setAmount(Number(event.target.value));
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
              Set Buy Trigger
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
              onClick={CancelAction}
            >
              Delete
            </Button>
            <Button
              className="mr-4"
              variant="outlined"
              color="secondary"
              onClick={CommitActionTrigger}
            >
              Set Buy Trigger
            </Button>
          </DialogActions>
        </div>
      ) : (
        <div>
          <DialogContent sx={{width: 450}}>
            <Typography variant="h5" className="mb-6">
              Set Buy Amount on Trigger - {stock.name}
            </Typography>
            <FormControl className="w-full">
              <TextField
                type="number"
                inputProps={{}}
                label="Set Buy Amount ($)"
                value={amount}
                onChange={handleAmountChange}
                fullWidth
              />
            </FormControl>

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
              onClick={executeAction}
              disabled={amount <= 0.0}
            >
              Set Buy Amount
            </Button>
          </DialogActions>
        </div>
      )}
    </div>
  );
}

export default BuyTriggerModal;