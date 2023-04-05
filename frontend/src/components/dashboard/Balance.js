import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../pages/_app';
import {
  Button,
  Paper,
  Typography,
  Modal,
  Box,
  TextField,
  Grid,
} from '@mui/material';

function Balance() {
  const [balance, setBalance] = useState(0.0);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0.0);
  const user = useContext(UserContext).user;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAmountChange = (event) => {
    setAmount(Number(event.target.value));
  };

  const getBalance = async () => {
    if (!user) {
      return;
    }
    const url = '/api/user/'.concat(user);
    try {
      const response_parsed = await (await fetch(url)).json();
      setBalance(response_parsed.balance);
      console.log("GetBalance",response_parsed.balance)
    } catch (error) {
      console.log(error);
    }
  };

  const addMoney = async () => {
    if (!user) {
        return;
    }
    const url = '/api/user/add';

    const fetchObj = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: user,
            amount: Number(amount)
        }),
    }

    try {
        const response_parsed = await (await fetch(url, fetchObj)).json();
        console.log("response:",response_parsed)
        setOpen(false);
    }catch (error) {
        console.log(error);
    }
  }

  useEffect(() => {
    getBalance();
  }, [user]);

  const modalBody = (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Add Funds
      </Typography>
      <TextField
        label="Amount ($)"
        type="number"
        fullWidth
        className="mt-4"
        value={amount}
        onChange={handleAmountChange}
        InputProps={{ inputProps: { min: 0 } }}
      />
      <Grid container justifyContent="flex-end" spacing={2} mt={2}>
        <Grid item>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button onClick={addMoney} variant="outlined" color="secondary">
            Add
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  return user ? (
    <>
      <Paper
        className="h-full flex flex-col justify-start p-4"
        sx={{ borderRadius: 3, maxWidth: 350 }}
        elevation={3}
      >
        <div>
          <Typography variant="h5" gutterBottom>
            Account Balance
          </Typography>
          <Typography variant="h3">${balance}</Typography>
          <Typography
            variant="subtitle2"
            gutterBottom
            color="secondary"
          >
            {new Date().toDateString()}
          </Typography>
        </div>
        <Button
          className="mt-auto w-40"
          variant="outlined"
          color="secondary"
          onClick={handleOpen}
        >
          Add Funds
        </Button>
      </Paper>
      <Modal open={open} onClose={handleClose}>
        {modalBody}
      </Modal>
    </>
  ) : (
    <></>
  );
}

export default Balance;
