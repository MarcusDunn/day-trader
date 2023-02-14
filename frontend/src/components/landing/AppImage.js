import { Container, Typography } from '@mui/material'
import React from 'react'

function AppImage() {
    return (
        <Container maxWidth="lg" sx={{height: "max(60vh, 300px)"}} className="flex items-center">
            <div className="grid grid-cols-2 gap-4">
                <div className="px-6 flex items-center" >
                    <div className="mb-20 w-full">
                        <Typography
                            variant="h4"
                            align='left'
                        >
                            Streamline your trading process 
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            color="secondary"
                            className="text-left text-l mb-4"
                            gutterBottom
                        >
                            Dashboard
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            className="text-left text-l"
                            gutterBottom
                        >
                            Stay on top of market movements with ease, view your entire portfolio from one screen providing your team with all the necessary tools for success
                        </Typography>
                    </div>
                </div>
                <div className="image-container">
                    <img src="/dashboard.png" alt="Our App" />
                </div>
            </div>
        </Container>
    )
}

export default AppImage