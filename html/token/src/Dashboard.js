import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';

import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';

import theme from './theme';
import { useEffect, useState, useReducer, useRef } from 'react';
import { loadAttributes } from './tools/biz.js'
import configData from './config/config.json'
import Button from '@mui/material/Button';

import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';

import NavList from './NavList';
import Title from './Title'
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReactDOM from 'react-dom';
import {QRCodeSVG} from 'qrcode.react';
import { visuallyHidden } from '@mui/utils';

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © Tremolo Security, Inc.'}
      <Link color="inherit" href="https://www.tremolosecurity.com/">
        https://wwww.tremolosecurity.com/
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const reducer = (state) => {
  
}


const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);



const mdTheme = createTheme();



function DashboardContent() {
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [pageName, setPageName] = React.useState('loading');

  const chooseScreenHandler = (screenName) => {
    setPageName(screenName);
  }

  const [config, setConfig] = React.useState({ "frontPage": { "title": "" } });
  const [user, setUser] = React.useState({ "token": {} });

  const [dialogTitle, setDialogTitle] = React.useState("Loading");
  const [dialogText, setDialogText] = React.useState("Connecting to OpenUnison");
  const [dialogButtonLabel, setDialogButtonLabel] = React.useState("OK");
  const [dialogButtonFunction, setDialogButtonFunction] = React.useState(function () { });
  const [showDialog, setShowDialog] = React.useState(true);
  const [showDialogButton, setShowDialogButton] = React.useState(false);
  const [ouTheme,setOuTheme] = React.useState(theme);
  const [loadedStatus,setLoadedStatus] = React.useState("");


  function extendSession() {
    fetch(configData.SERVER_URL + "main/config")
      .then(response => {
        if (!response.ok) {

          return Promise.resolve({});

        } else {

          return response.json();
        }
      }).then(data => {
        if (data && data.displayNameAttribute) {
          setShowDialog(false);
          setLoadedStatus("Reloaded session");
        } else {
          location.reload(true);
        }
      }).catch(err => {

        location.reload(true);
      });
  }


  const fetchData = () => {




    fetch(configData.SERVER_URL + "token/config")
      .then(response => {
        return response.json()
      })
      .then(dataConfig => {
        document.title = dataConfig.headerTitle + " - " + dataConfig.frontPage.title;
        
        setConfig(dataConfig);


        const deftheme = createTheme({
                  palette: {
                    primary: {
                      main: dataConfig.themePrimaryMain,
                      dark: dataConfig.themePrimaryDark,
                      light: dataConfig.themePrimaryLight,
                
                    },
                    secondary: {
                      main: dataConfig.themeSecondaryMain,
                      dark: dataConfig.themeSecondaryDark,
                      light: dataConfig.themeSecondaryLight,
                    },
                    error: {
                      main: dataConfig.errorColor,
                    },
                    text: {
                      secondary: '#525252',
                    },
                  },
                  components: {
                    MuiButton: {
                      defaultProps: {
                        disableRipple: true,
                      },
                    },
                  },
                });
        
        setOuTheme(deftheme);

        fetch(configData.SERVER_URL + "token/user")
          .then(response => {
            return response.json()
          })
          .then(data => {
            setUser(data);
            setShowDialog(false);
            setLoadedStatus("Token ready");

          })
      })
  }



  useInterval(() => {




    fetch(configData.SERVER_URL + "sessioncheck")
      .then(response => {
        if (response.status == 200) {
          return response.json();
        } else {
          return Promise.resolve({ "minsLeft": 0 });
        }
      })
      .then(data => {

        if (pageName != 'loading') {

          if (data.minsLeft <= 0) {
            // need to refresh
            // warn the user
            setDialogTitle("Session Timeout");
            setDialogText("Your session has timed out, hit OK to log back in");

            setShowDialog(true);
            setShowDialogButton(true);
          } else if (data.minsLeft < config.warnMinutesLeft) {

            // warn the user
            setDialogTitle("Session Timeout Warning");
            setDialogText("Warning, your session will timeout in " + data.minsLeft + " minutes, hit OK to continue your session");

            setShowDialog(true);
            setShowDialogButton(true);
          } else {
            setShowDialog(false);
            setShowDialogButton(false);
          }
        }
      })

  }, 60000);

  useEffect(() => {
    fetchData();
  }, [])





  return (
    <ThemeProvider theme={ouTheme}>
      <Dialog
        open={showDialog}

        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogText}
            <LinearProgress />
          </DialogContentText>
        </DialogContent>
        {showDialogButton ?
          <DialogActions>

            <Button onClick={(event) => {
              extendSession();
            }} autoFocus>
              {dialogButtonLabel}
            </Button>
          </DialogActions> : ""}
      </Dialog>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open} color="primary">
          <Toolbar
            sx={{
              pr: '24px', // keep right padding when drawer closed
            }}

          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              {config.headerTitle}
            </Typography>

          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <img src="images/logo-desktop.png" />
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />

          <NavList user={user} config={config} />


        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} >
            <Stack>
              <Title>{config.frontPage.title}</Title>
              {config.frontPage.text}
              <Grid container spacing={1} >
                {
                  Object.keys(user.token).map(key => {
                    return <Grid item xs={12} key={key}>
                      <Grid container spacing={0} >
                        <Grid item xs={1}>
                          <IconButton aria-label="copy" onClick={event => {
                            navigator.clipboard.writeText(user.token[key]);
                          }}>
                            <ContentCopyIcon />
                          </IconButton>
                        </Grid>
                        <Grid item xs={4}>
                          <b>{key}</b>
                        </Grid>
                        <Grid item xs={7}>
                          <pre style={{
                            "display": "block",
                            "padding": "9.5px",
                            "margin": "0 0 10px",
                            "color": "#333",
                            "border": "1px solid #ccc",
                            "overflow": "auto"
                          }}>{user.token[key]}</pre>
                        </Grid>
                      </Grid>
                      {
                        key == config.qrCodeAttribute ? 
                        <Grid container spacing={0} >
                          <Grid item xs={5}>
                            
                          </Grid>
                          <Grid item xs={7}>
                          <QRCodeSVG
                            value={user.token[key]}        // The URL to encode
                            size={200}         // Size of the QR Code (200x200 px)
                            bgColor="#ffffff"  // Background color
                            fgColor="#000000"  // Foreground color
                            level="H"          // Error correction level (L, M, Q, H)
                          />
                          </Grid>
                        </Grid>
                        
                        : ""
                      }
                    </Grid>
                  })
                }
              </Grid>
            </Stack>





            <Copyright sx={{ pt: 4 }} />
            <Typography aria-live="polite" role="status" sx={visuallyHidden}>
              {loadedStatus}
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
