import { Button, Paper, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../pages/_app';

function Balance() {
    const [balance, setBalance] = useState(420.69);
    const user = useContext(UserContext);
    
    const getBalance = async () => {
        // get balance and set it
    }
    useEffect(() => {
        getBalance();
    }, [])

    return (
        <Paper sx={{borderRadius: 3, maxWidth: 350}} className="p-4" elevation={3}>
            <Typography
                variant="h5"
                gutterBottom
            >
                Account Balance
            </Typography>
            <Typography variant="h3">
                ${balance}
            </Typography>
            <Typography variant="subtitle2" className="mb-10" gutterBottom color="secondary">
                {new Date().toDateString()}
            </Typography>
            <Button variant="outlined" color="secondary">
                Add Funds
            </Button>
        </Paper>
    )
}

export default Balance