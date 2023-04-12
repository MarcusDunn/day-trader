import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../pages/_app';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

function OwnedStocks() {
    const [stocks, setStocks] = useState([])
    const user = useContext(UserContext).user;
    const getOwnedStocks = async () => {
        if(!user){
            return;
        }
        const url = "/api/user/".concat(user);
        try{
            const response_parsed = await (await fetch(url)).json()
            setStocks(response_parsed.stock);
        }catch(error){
            console.log(error);
        }
    }

    useEffect(() => {
        getOwnedStocks();
    }, [user]);


    return (
        user ?
            <TableContainer component={Paper} sx={{borderRadius: 3, padding: 2}} elevation={3}>
                <Typography
                    variant="h5"
                    gutterBottom
                >
                    Owned Stocks
                </Typography>
                <Table size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Stock</TableCell>
                            <TableCell align="right">Stocks Owned</TableCell>
                            <TableCell align="right">View</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {stocks ? stocks.map((stock) => (
                        stock.stock && stock.stock >= 0.01 ? 
                            <TableRow
                                key={stock.name}
                            >
                                <TableCell align="left">{stock.name}</TableCell>
                                <TableCell align="right">{stock.stock ? stock.stock.toFixed(2) : 0.00}</TableCell>
                                <TableCell align="right">
                                    <Button variant="outlined" href={"/stocks/".concat(stock.name)}>
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                            :
                            <></>
                        ))
                            :
                        <></>
                    }
                    </TableBody>
                </Table>
            </TableContainer>
        :
            <></>
    )
}

export default OwnedStocks