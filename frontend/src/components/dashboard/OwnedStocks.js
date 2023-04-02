import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../pages/_app';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

function OwnedStocks() {
    const [stocks, setStocks] = useState([])
    const user = useContext(UserContext);
    const getOwnedStocks = async () => {
        const url = "/api/stocks/owned"
        try{
            const response_parsed = await (await fetch(url)).json()
            console.log(response_parsed);
            setStocks(response_parsed);
        }catch(error){
            console.log(error);
        }
    }

    useEffect(() => {
        getOwnedStocks();
    }, []);


    return (
        <TableContainer component={Paper} sx={{borderRadius: 3, padding: 2}} elevation={3}>
            <Typography
                variant="h5"
                gutterBottom
            >
                Owned Stocks
            </Typography>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>Stock</TableCell>
                        <TableCell align="right">Stocks Owned</TableCell>
                        <TableCell align="right">View</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {stocks.map((stock) => (
                    <TableRow
                    key={stock.name}
                    >
                        <TableCell align="left">{stock.name}</TableCell>
                        <TableCell align="right">{stock.stock}</TableCell>
                        <TableCell align="right">
                            <Button variant="outlined" href={"/stocks/".concat(stock.name)}>
                                View
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default OwnedStocks