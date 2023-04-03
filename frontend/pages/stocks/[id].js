import { Button, Container, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import StockHeader from '../../src/components/stocks/StockHeader'
import SingleStockBody from '../../src/components/stocks/SingleStockBody'
import { UserContext } from '../_app';
import BuySellStockMenu from '../../src/components/stocks/BuySellStockMenu';

function stock({ stock }) {
    const user = useContext(UserContext).user;
    const [userInfo, setUserInfo] = useState({});

    const getUserInfo = async () => {
        if (!user) {
          return;
        }
        const url = '/api/user/'.concat(user);
        try {
          const response_parsed = await (await fetch(url)).json();
          setUserInfo(response_parsed);
        } catch (error) {
          console.log(error);
        }
    };

    useEffect(() => {
        getUserInfo()
    }, [user]);

    return (
        stock.name !== "NOTFOUND" ? 
            <main>
                <StockHeader stock={stock} />
                {
                    user ?
                    <Container maxWidth="md" className="my-20">
                        <BuySellStockMenu stock={stock} userInfo={userInfo} />
                        <SingleStockBody stock={stock} userInfo={userInfo} />
                    </Container>
                        :
                    <Container maxWidth="md" className="my-20 m-auto text-center">
                        <Typography variant="h4" className="my-8">
                            Login to Buy and Sell Stocks
                        </Typography>
                        <Button variant="outlined" color="secondary" href="/login">Login</Button>
                    </Container>
                }
            </main>
        :
            <main>
                <Container maxWidth="md" className="my-20 text-center">
                    <Typography
                        variant="h2"
                        gutterBottom
                    >
                        Stock not found
                    </Typography>
                    <Button variant="outlined" href="/stocks">
                        Stocks
                    </Button>
                </Container>
            </main>

    )
}

export async function getServerSideProps({ query }) {
    const { id } = query
    const url = process.env.FRONTEND_URL ? process.env.FRONTEND_URL : "http://localhost:3000/"
    try{
        const res = await fetch(url.concat("api/stocks/",id));
        const data = await res.json()
        return { props: { stock: data } }
    }catch(error){
        console.log("error",error);
        return { props: {stock: {name: "NOTFOUND"}}}
    }
}

export default stock