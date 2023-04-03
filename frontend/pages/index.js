import React from 'react'
import Hero from '../src/components/landing/Hero';
import TrustedBy from '../src/components/landing/TrustedBy';
import AppImage from '../src/components/landing/AppImage';


export default function Index() {

  return (
    <main>
      <Hero />
      <AppImage />
      <TrustedBy />
    </main>
  );
}
