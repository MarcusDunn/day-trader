import { Box, Button, Container, Typography } from '@mui/material'
import React, { useContext } from 'react'
import { UserContext } from '../../../pages/_app';

function Hero() {
    const user = useContext(UserContext).user;

    return (
        <Box
            className="w-full h-screen backdrop-blur"
            sx={{
                background: `linear-gradient( rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7) ), url('/hero.jpg')`,
                backgroundPosition: "center",
                backgroundSize: "cover",
            }}
        >
            <Container maxWidth="lg" className="py-20 text-white flex items-center h-full">
                <div id="action-text" className="action w-1/2 text-center m-auto pb-20">
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                    >
                        Trade Faster. Earn More.
                    </Typography>
                    <Typography
                        variant="p"
                        component="h1"
                        className="text-xl mb-8"
                        gutterBottom
                    >
                        Experience lightning-fast trades and unparalleled quality with Swift Trader, designed to help you make informed decisions and maximize your profits with ease.
                    </Typography>
                    {user ?
                        <Button
                            variant="contained"
                            href="/dashboard"
                            color="secondary"
                        >
                            Dashboard
                        </Button>
                        :
                        <Button
                            variant="contained"
                            href="/signup"
                            color="primary"
                        >
                            Sign Up Today
                        </Button>
                    }
                </div>
            </Container>

        </Box>
    )
}

export default Hero