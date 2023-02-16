import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function StockOptions() {
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        const populatePage = async () => {
            await getStocks();
        }
        populatePage();
    }, [])

    const getStocks = async () => {
        try {    
            const response = await (await fetch("/api/stocks")).json()
            setStocks(response.stocks);
            console.log(response.stocks)
        }catch(error){
            console.log(error);
        }
    }


    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                <TableRow>
                    <TableCell>Stock</TableCell>
                    <TableCell align="right">Price</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {stocks.map((stock) => (
                    <TableRow key={stock.name}>
                        <TableCell component="th" scope="row">
                            {stock.name}
                        </TableCell>
                        <TableCell align="right">
                            ${stock.price}
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default StockOptions