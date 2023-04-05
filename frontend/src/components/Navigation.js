import React, { useState, useEffect, useContext } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Toolbar,
  Typography,
  useTheme,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon
} from '@mui/material';
import { UserContext } from '../../pages/_app';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';

function Navigation() {
  const user = useContext(UserContext).user;
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const openAvatarMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeAvatarMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Implement logout logic here
    localStorage.removeItem('jwt');
    window.location.href = "/";
  };

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
          <ButtonBase href="/">
            <Typography variant="h6" noWrap color={scrolled ? 'inherit' : 'text'}>
              Swift Trader
            </Typography>
          </ButtonBase>
        </Box>
        {!user ? (
          <nav>
            <ButtonBase href="/pricing" sx={{ my: 1, mx: 1.5 }}>
              <Typography className="font-medium" color={scrolled ? 'inherit' : 'text'}>
                Pricing
              </Typography>
            </ButtonBase>
            <ButtonBase href="/stocks" sx={{ my: 1, mx: 1.5 }}>
              <Typography className="font-medium" color={scrolled ? 'inherit' : 'text'}>
                Stocks
              </Typography>
            </ButtonBase>
          </nav>
        ) : (
          <nav>
            <ButtonBase href="/dashboard" sx={{ my: 1, mx: 1.5 }}>
              <Typography className="font-medium" color={scrolled ? 'inherit' : 'text'}>
                Dashboard
              </Typography>
            </ButtonBase>
          </nav>
        )}
        {(user) ? (
          <React.Fragment>
            <Avatar
              className="mx-3 my-2"
              sx={{ bgcolor: theme.palette.secondary.main, height: 35, width: 35, cursor: 'pointer', boxShadow: theme.shadows[5],}}
              onClick={openAvatarMenu}
            >
              {user[0] ? user[0].toUpperCase() : user[0]}
            </Avatar>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={Boolean(anchorEl)}
                onClose={closeAvatarMenu}
                PaperProps={{ // code from material ui examples
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                        },
                        '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={closeAvatarMenu}>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}/> {user}
                </MenuItem>
                <Divider />
                <MenuItem onClick={closeAvatarMenu}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                    </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
          </React.Fragment>
        ) : (
          <Button href="/login" color="secondary" variant="outlined" sx={{ my: 1, mx: 1.5 }}>
          Login
        </Button>
      )}
    </Toolbar>
  </AppBar>
  );
}

export default Navigation;
