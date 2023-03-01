import React from 'react'
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import Copyright from '../src/components/Copyright';
import Hero from '../src/components/landing/Hero';
import TrustedBy from '../src/components/landing/TrustedBy';
import AppImage from '../src/components/landing/AppImage';


export default function Index() {

  return (
    <main>
      <Hero />
      <AppImage />
      <TrustedBy />
      <Copyright />
    </main>
  );
}
