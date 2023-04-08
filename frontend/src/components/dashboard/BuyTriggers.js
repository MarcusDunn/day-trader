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

function BuyTriggers() {
  const [buyTriggers, setBuyTriggers] = useState([]);
  const user = useContext(UserContext).user;

  const getBuyTriggers = async () => {
    if (!user) {
      return;
    }
    const url = '/api/user/'.concat(user);
    try {
      const response_parsed = await (await fetch(url)).json();
      setBuyTriggers(response_parsed.BuyTriggers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBuyTriggers();
  }, [user]);

  return user ? (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: 3, padding: 2 }}
      elevation={3}
    >
      <Typography variant="h5" gutterBottom>
        Buy Triggers
      </Typography>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Stock</TableCell>
            <TableCell align="right">Trigger Amount</TableCell>
            <TableCell align="right">Shares to Buy</TableCell>
            <TableCell align="right">View</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {buyTriggers ? 
            buyTriggers.map((trigger) => (
              <TableRow key={trigger.name}>
                <TableCell align="left">{trigger.name}</TableCell>
                <TableCell align="right">${trigger.triggerAmount.toFixed(2)}</TableCell>
                <TableCell align="right">{trigger.buyAmount.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Button variant="outlined" href={'/stocks/'.concat(trigger.name)}>
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

export default BuyTriggers;
