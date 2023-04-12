import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../pages/_app';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

function SellTriggers() {
  const [sellTriggers, setSellTriggers] = useState([]);
  const user = useContext(UserContext).user;

  const getSellTriggers = async () => {
    if (!user) {
      return;
    }
    const url = '/api/user/'.concat(user);
    try {
      const response_parsed = await (await fetch(url)).json();
      setSellTriggers(response_parsed.SellTriggers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSellTriggers();
  }, [user]);

  return user ? (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: 3, padding: 2 }}
      elevation={3}
    >
      <Typography variant="h5" gutterBottom>
        Sell Triggers
      </Typography>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Stock</TableCell>
            <TableCell align="right">Trigger Amount</TableCell>
            <TableCell align="right">Shares to Sell</TableCell>
            <TableCell align="right">View</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sellTriggers ? 
            sellTriggers.map((trigger) => (
              <TableRow key={trigger.stock}>
                <TableCell align="left">{trigger.stock}</TableCell>
                <TableCell align="right">${trigger.triggerAmount.toFixed(2)}</TableCell>
                <TableCell align="right">{trigger.sharesToSell.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Button variant="outlined" href={'/stocks/'.concat(trigger.stock)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
            :
            <></>
          }
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <></>
  );
}

export default SellTriggers;
