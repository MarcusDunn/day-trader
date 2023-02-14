import React from 'react'
import SchoolIcon from '@mui/icons-material/School';
import FoundationIcon from '@mui/icons-material/Foundation';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import { Box, Container, Paper, Typography, useTheme } from '@mui/material';

function TrustedBy() {
    const theme = useTheme()
    const companies = [
        {
            name: "University of Victoria",
            since: "2023",
            icon: <SchoolIcon sx={{transform: 'scale(4)'}}/>,
        },
        {
            name: "Totally Real Company",
            since: "1999",
            icon: <FoundationIcon sx={{transform: 'scale(4)'}}/>,
        },
        {
            name: "Yeppers Inc.",
            since: "2010",
            icon: <DeliveryDiningIcon sx={{transform: 'scale(4)'}}/>,
        },
        {
            name: "To the Moon LLC",
            since: "2015",
            icon: <AutoGraphIcon sx={{transform: 'scale(4)'}}/>,
        },
    ]

    const trustsUs = (company) => {
        return (
            // <Paper elevation={8} sx={{ borderRadius: 10, width: "250px" }} className="p-4 text-center">
            <Box sx={{ width: "250px" }} className="p-4 text-center text-white">
                <Typography
                    variant="h6"
                    align="center"
                    gutterBottom
                >
                    {company.name}
                </Typography>
                <div className="my-11">{company.icon}</div>
                <Typography
                    variant="subtitle2"
                    align="center"
                >
                    Since {company.since}
                </Typography>
            </Box>
        )
    }

    return (
        <Box className="w-full py-8 flex items-center" sx={{backgroundColor: theme.palette.primary.dark, height: "45vh"}}>
            <Container maxWidth="lg" className="mb-8">
                <Typography
                    variant="h4"
                    align="center"
                    color="white"
                    gutterBottom
                >
                    Trusted By
                </Typography>
                <Typography
                    variant="h6"
                    align="center"
                    className="text-l mb-12"
                    color="white"
                    gutterBottom
                >
                    Join the ranks of top companies and take control of your investments today
                </Typography>
                <div className="flex justify-center">
                    {companies.map((company) => (trustsUs(company)))}
                </div>
            </Container>
        </Box>
    )
}

export default TrustedBy