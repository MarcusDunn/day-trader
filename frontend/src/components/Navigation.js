import React, { useState, useEffect } from 'react'
import { AppBar, Box, Button, ButtonBase, Link, Toolbar, Typography, useTheme } from '@mui/material'

function Navigation() {
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
                    <ButtonBase
                        href="/dashboard"
                        sx={{ my: 1, mx: 1.5 }}
                    >
                        <Typography className="font-medium" color={scrolled ? 'inherit' : 'text'} >Dashboard</Typography>
                    </ButtonBase>
                </nav>
                <Button 
                    href="/login" 
                    color="secondary"
                    variant="outlined" 
                    sx={{ my: 1, mx: 1.5 }}
                >
                    Login
                </Button>
            </Toolbar>
        </AppBar>
    )
}

export default Navigation