import { Button, Container, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import StockHeader from '../../src/components/stocks/StockHeader'
import SingleStockBody from '../../src/components/stocks/SingleStockBody'
import { UserContext } from '../_app';
import BuySellStockMenu from '../../src/components/stocks/BuySellStockMenu';
import BuyModal from '../../src/components/stocks/BuyModal';

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
                    <div>
                        <Container maxWidth="lg" className="mt-20">
                            <Container maxWidth="sm" className="mt-20">
                                <BuyModal userInfo={userInfo} stock={stock} handleClose={() => {console.log("handleClose")}}/>
                                
                            </Container>
                            <SingleStockBody className="my-12" stock={stock} userInfo={userInfo} />
                        </Container>
                        <Container maxWidth="md" className="my-20 text-center">
                            <Typography variant="p" display={'block'} className="my-5 text-xl">
                                {stock.name} is a global leader in the manufacturing and distribution of consumer electronics, with a wide range of products including smartphones, tablets, laptops, and home appliances. The company has a strong reputation for quality and innovation, with a long history of producing cutting-edge technology that exceeds customer expectations.
                                {stock.name}'s success in the consumer electronics market has been reflected in its stock prices, which have consistently performed well over the years. Despite facing stiff competition from other major players in the industry, {stock.name} has managed to maintain its position as a top performer, thanks to its focus on research and development and its ability to stay ahead of the curve in terms of technology trends.
                            </Typography>
                            <Typography variant="p" display={'block'} className="my-5 text-xl">
                                Investors have been particularly drawn to {stock.name}'s stock prices due to the company's steady growth and strong financial performance. Despite economic downturns and other external factors that have affected many companies in the past, {stock.name} has remained resilient and has continued to generate healthy profits for its shareholders.
                            </Typography>
                            <Typography variant="p" display={'block'} className="my-5 text-xl">
                                The company's stock prices have also been buoyed by its expansion into new markets and its ongoing efforts to diversify its product offerings. {stock.name} has invested heavily in research and development in recent years, exploring new areas such as artificial intelligence, virtual reality, and renewable energy, and is well-positioned to take advantage of emerging opportunities in these and other sectors.
                            </Typography>
                            <Typography variant="p" display={'block'} className="my-5 text-xl">
                                Overall, {stock.name}'s stock prices have been a strong performer in the consumer electronics sector, reflecting the company's reputation for quality, innovation, and financial stability. As the global economy continues to recover from recent challenges, investors are likely to continue to look to {stock.name} as a top choice for long-term growth and stability in the years to come.
                            </Typography>
                        </Container>
                    </div>
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