import React, {useState, useEffect, useContext, createContext} from 'react'
import PropTypes from 'prop-types';
import Head from 'next/head';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import {lightTheme, darkTheme } from '../src/theme'
import '../src/globals.css'
import createEmotionCache from '../src/createEmotionCache';
import Navigation from '../src/components/Navigation';
import Copyright from '../src/components/Copyright';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

const ThemeContext = createContext({theme: {}});
export const UserContext = createContext({});

export const useMyTheme = () => useContext(ThemeContext);

export default function MyApp(props) {
  const [myTheme, setMyTheme] = useState(createTheme(lightTheme));
  const [theme, setTheme] = useState(createTheme(lightTheme));
  const [user, setUser] = useState(undefined);
  useEffect(()=> {
    const jwt = localStorage.getItem('jwt');
    if (jwt && jwt !== 'undefined') {
      setUser(jwt);
    } else {
      setUser(undefined);
    }
  },[])

  useEffect(()=> {
      setTheme(createTheme(myTheme));
  },[myTheme])

  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  

  return (
    <UserContext.Provider value={{user}}>
      <ThemeContext.Provider value={{theme, setMyTheme}}>
        <CacheProvider value={emotionCache}>
          <Head>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Navigation />
            <Component {...pageProps} />
            <Copyright />
          </ThemeProvider>
        </CacheProvider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};
