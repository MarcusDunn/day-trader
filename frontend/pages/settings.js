import { Button, Container, Divider, Typography } from '@mui/material'
import React, { useContext } from 'react'
import { UserContext } from './_app'

function settings() {
    const user = useContext(UserContext).user
    if(!user){
        return(<></>);
    }
    const getDumpLog = async () => {
        if(!user){
            return;
        }
        const url = "/api/log/system";
        const fetchArgs = {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: user})
        }
        try{
            const response_parsed = await (await fetch(url, fetchArgs)).json()
            console.log(response_parsed);
        }catch(error){
            console.log(error);
        }
    }
    const getUserDumpLog = async() => {
        if(!user){
            return;
        }
        const url = "/api/log/user";
        const fetchArgs = {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: user})
        }
        try{
            const response_parsed = await (await fetch(url, fetchArgs)).json()
            console.log(response_parsed);
        }catch(error){
            console.log(error);
        }
    }
    const getUserSummary = async() => {
        if(!user){
            return;
        }
        const url = "/api/log/summary";
        const fetchArgs = {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: user})
        }
        try{
            const response_parsed = await (await fetch(url, fetchArgs)).json()
            console.log(response_parsed);
            
            const link = document.createElement('a');
            link.download = 'UserSummary.json';
            const blob = new Blob([JSON.stringify(response_parsed)], {type: 'application/json'});
            link.href = URL.createObjectURL(blob);
            link.click();
        }catch(error){
            console.log(error);
        }
    }

    return (
        <Container maxWidth="md" className="mt-20 text-center">
            <Typography variant="h2">
                Settings
            </Typography>
            <Typography variant="subtitle2" className="mb-8">
                {user}
            </Typography>
            <div className="flex flex-row justify-between flex-wrap">
                <div className="my-4">
                    <Typography variant="h5" gutterBottom>
                        System Dump Log
                    </Typography>
                    <Button variant="outlined" color="secondary" onClick={getDumpLog}>
                        Get System Dump Log
                    </Button>
                </div>
                <Divider orientation="vertical" flexItem />
                <div className="my-4">
                    <Typography variant="h5" gutterBottom>
                        User Dump Log
                    </Typography>
                    <Button variant="outlined" color="secondary" onClick={getUserDumpLog}>
                        Get User Dump Log
                    </Button>
                </div>
                <Divider orientation="vertical" flexItem />
                <div className="my-4">
                    <Typography variant="h5" gutterBottom>
                        User Summary
                    </Typography>
                    <Button variant="outlined" color="secondary" onClick={getUserSummary}>
                        Get User Summary
                    </Button>
                </div>
            </div>
            
            
            
        </Container>
    )
}

export default settings