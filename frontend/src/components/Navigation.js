import React, { useState, useEffect, useContext } from 'react'
import { AppBar, Avatar, Box, Button, ButtonBase, Link, Toolbar, Typography, useTheme } from '@mui/material'
import { UserContext } from '../../pages/_app';

function Navigation() {
    const { user } = useContext(UserContext);
    console.log(user);
    const theme = useTheme()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
        setScrolled(window.scrollY > 0)
        }

        window.addEventListener('scroll', handleScroll)

        return () => {
        window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const openAvatarMenu = () => {
        console.log("Hola")
    }


    return (
        <AppBar
            position="fixed"
            style={{
                backgroundColor: scrolled ? theme.palette.primary.main : 'transparent',
                boxShadow: scrolled ? theme.shadows[3] : 'none',
                transition: 'background-color 0.3s ease-out, box-shadow 0.3s ease-out',
                backgroundImage: 'inherit',
            }}
        >
            <Toolbar sx={{ flexWrap: 'wrap' }}>
                <Box sx={{ flexGrow: 1 }}>
                    <ButtonBase
                        href="/"
                    >
                        <Typography variant="h6" noWrap color={scrolled ? 'inherit' : 'text'}>
                            Swift Trader
                        </Typography>
                    </ButtonBase>
                </Box>
                {
                    !user ?
                    <nav>
                        <ButtonBase
                            href="/pricing"
                            sx={{ my: 1, mx: 1.5 }}
                            >
                            <Typography className="font-medium" color={scrolled ? 'inherit' : 'text'} >Pricing</Typography>
                        </ButtonBase>
                        <ButtonBase
                            href="/stocks"
                            sx={{ my: 1, mx: 1.5 }}
                            >
                            <Typography className="font-medium" color={scrolled ? 'inherit' : 'text'} >Stocks</Typography>
                        </ButtonBase>
                    </nav>
                    :
                    <nav>
                        <ButtonBase
                            href="/dashboard"
                            sx={{ my: 1, mx: 1.5 }}
                        >
                            <Typography className="font-medium" color={scrolled ? 'inherit' : 'text'} >Dashboard</Typography>
                        </ButtonBase>
                    </nav>
                }
                {
                    user ?
                        <Avatar className="mx-3 my-2"sx={{ bgcolor: theme.palette.secondary.main, height: 35, width: 35 }} onClick={openAvatarMenu}>{
                            user[0] ? user[0].toUpperCase() : user[0]
                            }
                        </Avatar>
                        :
                        <Button 
                            href="/login" 
                            color="secondary"
                            variant="outlined" 
                            sx={{ my: 1, mx: 1.5 }}
                        >
                            Login
                        </Button>
                }
            </Toolbar>
        </AppBar>
    )
}

export default Navigation