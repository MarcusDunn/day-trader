import { Box, Button, TextField, Typography } from '@mui/material';
import React, { useContext, useState } from 'react'
import { UserContext } from '../../../pages/_app';

function BuyModal({ stock, userInfo, handleClose }) {
    const user = useContext(UserContext).user;
    if(!stock || !userInfo || !user){
        return <></>
    }
    const [amount, setAmount] = useState(0.0);
    const [buyResponse, setBuyResponse] = useState({});
    const [readyToCommit, setReadyToCommit] = useState(false);
    const [error, setError] = useState("");

    const Buy = async () => {
        const url = '/api/stocks/buy';
        const body = {
            username: user,
            stock: stock.name,
            amount: amount, 
        }
        const fetchArgs = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }
        try {
            const response_parsed = await (await fetch(url, fetchArgs)).json();
            console.log("response_parsed",response_parsed)
            if(response_parsed.success == true){
                setReadyToCommit(true);
                setBuyResponse(response_parsed)
            }else{
                setError("Unsuccesful Buy Attempt")
            }
        } catch (error) {
            console.log(error);
            setError("Unsuccesful Buy Attempt")
        }
    }

    const CommitBuy = async () => {
        const url = '/api/stocks/buy/commit';
        const body = {
            username: userInfo.username,
        }
        const fetchArgs = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }
        try {
            const response_parsed = await (await fetch(url, fetchArgs)).json();
            if(response_parsed.success == true){
                handleClose();
            }else{
                setError("Unsuccesful Commit Buy Attempt")
            }
        } catch (error) {
            console.log(error);
            setError("Unsuccesful Commit Buy Attempt")
        }
    }

    const CancelBuy = async () => {
        const url = '/api/stocks/buy/cancel';
        const body = {
            username: userInfo.username,
        }
        const fetchArgs = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }
        try {
            const response_parsed = await (await fetch(url, fetchArgs)).json();
            if(response_parsed.success == true){
                setReadyToCommit(false);
            }else{
                setError("Unsuccesful Cancel Buy Attempt")
            }
        } catch (error) {
            console.log(error);
            setError("Unsuccesful Cancel Buy Attempt")
        }
    }

    const handleAmountChange = (event) => {
        setAmount(Number(event.target.value));
    }


    return (
        <Box className="p-4">
            {readyToCommit ? 
                <div>
                    <Typography variant="h4" gutterBottom>
                        Commit {stock.name} Buy
                    </Typography>
                    <Typography variant="p" display={'block'} className="text-lg" gutterBottom>
                        Commit buying {buyResponse.shares.toFixed(2)} shares at ${(amount/(buyResponse.shares)).toFixed(2)}/share
                    </Typography>
                    <Typography variant="subtitle2" display={'block'} color="error" gutterBottom>
                        {error}
                    </Typography>
                    <div className="flex justify-start my-4">
                        <Button className="mr-4" variant="outlined" color="secondary" onClick={CommitBuy}>
                            Commit Buy
                        </Button>
                        <Button className="mr-4" variant="outlined" color="primary" onClick={CancelBuy}>
                            Cancel
                        </Button>
                    </div>
                </div>
                :
                <div>
                    <Typography variant="h4" gutterBottom>
                        Buy {stock.name}
                    </Typography>
                    <TextField type="number" inputProps={{}} label="Amount ($)" value={amount} onChange={handleAmountChange} />
                    <Typography variant="subtitle2" display={'block'} color="error" gutterBottom>
                        {error}
                    </Typography>
                    <div className="flex justify-start my-4">
                        <Button className="mr-4" variant="outlined" color="secondary" onClick={Buy} disabled={ amount <= 0.0}>
                            Buy {stock.name}
                        </Button>
                        <Button className="mr-4" variant="outlined" color="primary" onClick={handleClose}>
                            Cancel
                        </Button>
                    </div>
                </div>
            }
        </Box>
    )
}

export default BuyModal