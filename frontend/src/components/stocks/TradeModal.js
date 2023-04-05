import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogContent,
  DialogActions,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../pages/_app";
import useInterval from "../../utils/useInterval";

function TradeModal({ stock, userInfo, handleClose }) {
  const user = useContext(UserContext).user;
  const tick_time = 59;
  const [timer, setTimer] = useState(tick_time);
  const [action, setAction] = useState("buy");
  const [amount, setAmount] = useState(0.0);
  const [actionResponse, setActionResponse] = useState({});
  const [readyToCommit, setReadyToCommit] = useState(false);
  const [error, setError] = useState("");

  if (!stock || !userInfo || !user) {
    return <></>;
  }

  useInterval(() => {
    if (readyToCommit && timer > 0) {
      setTimer(timer - 1);
    } else if (timer === 0) {
      setTimer(tick_time);
      setReadyToCommit(false);
    }
  }, 1000);

  const executeAction = async () => {
    const url = `/api/stocks/${action}`;
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
          `Unsuccessful ${
            action.charAt(0).toUpperCase() + action.slice(1)
          } Attempt`
        );
      }
    } catch (error) {
      console.log(error);
      setError(
        `Unsuccessful ${
          action.charAt(0).toUpperCase() + action.slice(1)
        } Attempt`
      );
    }
  };

  const CommitAction = async () => {
    const url = `/api/stocks/${action}/commit`;
    const body = {
      username: userInfo.username,
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
        handleClose();
      } else {
        setError(
          `Unsuccessful Commit ${
            action.charAt(0).toUpperCase() + action.slice(1)
          } Attempt`
        );
      }
    } catch (error) {
      console.log(error);
      setError(
        `Unsuccessful Commit ${
          action.charAt(0).toUpperCase() + action.slice(1)
        } Attempt`
      );
    }
  };

  const CancelAction = async () => {
    const url = `/api/stocks/${action}/cancel`;
    const body = {
      username: userInfo.username,
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
        setTimer(tick_time);
      } else {
        setError(
          `Unsuccessful Cancel ${
            action.charAt(0).toUpperCase() + action.slice(1)
          } Attempt`
        );
      }
    } catch (error) {
      console.log(error);
      setError(
        `Unsuccessful Cancel ${
          action.charAt(0).toUpperCase() + action.slice(1)
        } Attempt`
      );
    }
  };

  const handleAmountChange = (event) => {
    setAmount(Number(event.target.value));
  };

  return (
    <div className="p-4" >
      {readyToCommit ? (
        <div>
          <DialogContent sx={{width: 450}}>
            <Typography variant="h5" className="mb-6">
              Commit {stock.name}{" "}
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </Typography>
            <Typography
              variant="p"
              display={"block"}
              className="text-lg"
              gutterBottom
            >
              Commit {action}ing {actionResponse.shares.toFixed(2)} shares at $
              {(amount / actionResponse.shares).toFixed(2)}/share
            </Typography>
            <Typography
              variant="subtitle2"
              display={"block"}
              color="error"
              gutterBottom
            >
              {error}
            </Typography>
            <Typography variant="subtitle2" display={"block"} gutterBottom>
              Time remaining: {timer} seconds
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              className="mr-4"
              variant="outlined"
              color="primary"
              onClick={CancelAction}
            >
              Cancel
            </Button>
            <Button
              className="mr-4"
              variant="outlined"
              color="secondary"
              onClick={CommitAction}
            >
              Commit {action.charAt(0).toUpperCase() + action.slice(1)}
            </Button>
          </DialogActions>
        </div>
      ) : (
        <div>
          <DialogContent sx={{width: 450}}>
            <Typography variant="h5" className="mb-6">
              {action.charAt(0).toUpperCase() + action.slice(1)} {stock.name}
            </Typography>
            <FormControl className="w-full">
              <div className="mb-6">
                <InputLabel id="action-select-label">Action</InputLabel>
                <Select
                  fullWidth
                  labelId="action-select-label"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                >
                  <MenuItem value="buy">Buy</MenuItem>
                  <MenuItem value="sell">Sell</MenuItem>
                </Select>
              </div>
              <TextField
                type="number"
                inputProps={{}}
                label="Amount ($)"
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
              {action.charAt(0).toUpperCase() + action.slice(1)} {stock.name}
            </Button>
          </DialogActions>
        </div>
      )}
    </div>
  );
}

export default TradeModal;
