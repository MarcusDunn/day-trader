import { Button, Paper, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../pages/_app';

function Balance() {
    const [balance, setBalance] = useState(0.0);
    const user = useContext(UserContext).user;
    
    const getBalance = async () => {
        if(!user){
            return;
        }
        const url = "/api/user/".concat(user);
        try{
            const response_parsed = await (await fetch(url)).json()
            setBalance(response_parsed.balance);
        }catch(error){
            console.log(error);
        }
    }

    useEffect(() => {
        getBalance();
    }, [])

    return (
        user ? 
            <Paper className="h-full flex flex-col justify-start p-4" sx={{borderRadius: 3, maxWidth: 350 }} elevation={3}>
                <div>
                    <Typography
                        variant="h5"
                        gutterBottom
                    >
                        Account Balance
                    </Typography>
                    <Typography variant="h3">
                        ${balance}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom color="secondary">
                        {new Date().toDateString()}
                    </Typography>
                </div>
                <Button className="mt-auto w-40" variant="outlined" color="secondary">
                    Add Funds
                </Button>
            </Paper>
            :
            <></>
    )
}

export default Balance
