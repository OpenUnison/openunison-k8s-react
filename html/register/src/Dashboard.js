import * as React from 'react';
import { Component } from 'react';
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
import { useEffect, useState, useReducer, useRef, lazy } from 'react';
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


import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { TextField } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import { Interweave } from 'interweave';
import Switch from '@mui/material/Switch'

import ReCAPTCHA from "react-google-recaptcha"

//import RegisterFunctions from './register-functions.js'

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

  const [config, setConfig] = React.useState({ "frontPage": { "title": "" }, "attributeNameList": [], "headerTitle": "OpenUnisonX" });
  const [userData, setUserData] = React.useState({});

  const [user, setUser] = React.useState({ "token": {} });

  const [dialogTitle, setDialogTitle] = React.useState("Loading");
  const [dialogText, setDialogText] = React.useState("Connecting to OpenUnison");
  const [dialogButtonLabel, setDialogButtonLabel] = React.useState("OK");
  const [dialogButtonFunction, setDialogButtonFunction] = React.useState(function () { });
  const [showDialog, setShowDialog] = React.useState(true);
  const [showDialogButton, setShowDialogButton] = React.useState(false);

  
  const [submitRequestErrors, setSubmitRequestErrors] = React.useState([]);
  const [submitRequestSuccess, setSubmitRequestSuccess] = React.useState(false);

  const [extUrls, setExtUrls] = React.useState([]);
  const [saveEnabled, setSaveEnabled] = React.useState(true);
  const [scripts, setScripts] = React.useState([]);
  const [ouTheme,setOuTheme] = React.useState(theme);

  const [rcResponse,setRcResponse] = React.useState("");
  const recaptchaRef = React.createRef();
  



  function extendSession() {
    fetch(configData.SERVER_URL + "register/config")
      .then(response => {
        if (!response.ok) {

          return Promise.resolve({});

        } else {

          return response.json();
        }
      }).then(data => {
        if (data && data.displayNameAttribute) {
          setShowDialog(false);
        } else {
          location.reload(true);
        }
      }).catch(err => {

        location.reload(true);
      });
  }



  const fetchData = () => {




    fetch(configData.SERVER_URL + "register/config")
      .then(response => {
        return response.json()
      })
      .then(dataConfig => {
        
        

        var localDataConfig = {...dataConfig};

        setExtUrls(dataConfig.jsUris);

        var localUserData = {
          "attributes": {},
          "extraData": {},
          "enabledAttrs": {},
          "reason": ""
        };

        if (dataConfig.reasonIsList) {
          if (dataConfig.reasons && dataConfig.reasons.length > 0) {
            localUserData.reason = dataConfig.reasons[0];
          }
        }

        Object.keys(dataConfig.attributes).map(key => {
          var attrCfg = dataConfig.attributes[key];

          if (dataConfig.attributes[key].values && dataConfig.attributes[key].values.length > 0 && dataConfig.attributes[key].type != "text-list-box" && dataConfig.attributes[key].type != "chk-text-list-box") {

            localUserData.attributes[key] = dataConfig.attributes[key].values[0].value;
          } else {
            localUserData.attributes[key] = "";
          }
          localUserData.enabledAttrs[key] = true;
        });

        if (rcResponse != "") {
          localUserData.reCaptchaCode = rcResponse;
        }

        setConfig(localDataConfig);
        setUserData(localUserData);

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
            }
          },
        });

        setOuTheme(deftheme);

        var newScripts = [];

        dataConfig.jsUris.map(scriptUrl => {
          var script = document.createElement('script');
          script.src = configData.SERVER_URL + scriptUrl;
          script.async = true;
          document.body.appendChild(script);
          newScripts.push(script);
        })

        setScripts(newScripts);
        setShowDialog(false);
        return () => {
          newScripts.map(script => { document.body.removeChild(script) })
        }
      })
  }



  /*useInterval(() => {




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

  }, 60000);*/

  useEffect(() => {
    fetchData();
  }, [])



  function formClass() {
    
      return 12;
    
  }

  function controlLabel(attributeName) {
    if (config.enableThirdColumn && userData.extraData[attributeName]) {
      return config.attributes[attributeName].displayName + ': ' + userData.extraData[attributeName];
    } else {
      return config.attributes[attributeName].displayName;
    }
  }

  function controlLabelSimple(attributeName) {
    return config.attributes[attributeName].displayName;
  }

  function onEnabledCheckboxChanged(event,attributeConfig) {
    var localConfig = {...config};
    var localUserData = { ...userData };
    localConfig.attributes[attributeConfig.name].enabled = event.target.checked;

    if (! event.target.checked) {
      localUserData.attributes[attributeConfig.name] = "";
    } 
    
    setConfig(localConfig);
    setUserData(localUserData);

  }

  function onTextButtonInputChange(event, attributeConfig) {
    /*var localUserData = {...userData};
    localUserData.attributes[attributeConfig.name] = event.target.value;
    setUserData(localUserData);*/

    
    var localUserData = { ...userData };


    if (event.target.textContent) {
      localUserData.attributes[attributeConfig.name] = event.target.textContent;
    }
    else {
      localUserData.attributes[attributeConfig.name] = event.target.value;
    }




    var eventObj = {
      configData: configData,
      event: event,
      attributeConfig: attributeConfig,
      userData: localUserData,
      config: { ...config },
      setUserData: setUserData,
      setConfig: setConfig,
      setSubmitRequestErrors: setSubmitRequestErrors
    };


    
    setUserData(localUserData);
    setConfig(config);
    
    



  }

  function onTextInputChange(event, attributeConfig) {
    /*var localUserData = {...userData};
    localUserData.attributes[attributeConfig.name] = event.target.value;
    setUserData(localUserData);*/

    if (attributeConfig.type == "text-list-box" || attributeConfig.type == "text-list" || attributeConfig.type == "chk-text-list-box") {
      fetch(configData.SERVER_URL + "register/values?name=" + attributeConfig.name + '&search=' + event.target.value)
        .then(
          response => {
            if (response.ok) {
              return response.json();
            } else {
              return new Promise([]);
            }
          }
        )
        .then(json => {
          attributeConfig.values = json;

          attributeConfig.acValues = [{ "label": "", "value": "" }];

          attributeConfig.values.map(value => {
            attributeConfig.acValues.push({ "label": value.name, "value": value.value });
          });

          editEvent(attributeConfig, event);
        });
    } else {
      editEvent(attributeConfig, event);
    }



  }

  function onListInputChange(event, attributeConfig) {
    editEvent(attributeConfig, event);
  }

  function onButtonClick(attributeConfig, event) {
    var localUserData = { ...userData };

    var eventObj = {
      configData: configData,
      event: event,
      attributeConfig: attributeConfig,
      userData: localUserData,
      config: { ...config },
      setUserData: setUserData,
      setConfig: setConfig,
      setSubmitRequestErrors: setSubmitRequestErrors,
      setShowDialog: setShowDialog,
      setDialogText: setDialogText,
      setDialogTitle: setDialogTitle,
      setShowDialogButton: setShowDialogButton,
      setDialogButtonLabel: setDialogButtonLabel,
      setDialogButtonFunction: setDialogButtonFunction
    };


    if (attributeConfig.editJavaScriptFunction) {
      eval(attributeConfig.editJavaScriptFunction);
    } else {
      setUserData(localUserData);
      setConfig(config);
    }


  }

  function editEvent(attributeConfig, event) {
    var localUserData = { ...userData };


    if (event.target.textContent) {
      localUserData.attributes[attributeConfig.name] = event.target.textContent;
    }
    else {
      localUserData.attributes[attributeConfig.name] = event.target.value;
    }




    var eventObj = {
      configData: configData,
      event: event,
      attributeConfig: attributeConfig,
      userData: localUserData,
      config: { ...config },
      setUserData: setUserData,
      setConfig: setConfig,
      setSubmitRequestErrors: setSubmitRequestErrors
    };


    if (attributeConfig.editJavaScriptFunction) {
      eval(attributeConfig.editJavaScriptFunction);
    } else {
      setUserData(localUserData);
      setConfig(config);
    }


  }

  function createTextListInput(attributeConfig) {

    attributeConfig.acValues = [{ "label": "", "value": "" }];

    attributeConfig.values.map(value => {
      attributeConfig.acValues.push({ "label": value.name, "value": value.value });
    });



    return <Autocomplete
      key={attributeConfig.name}
      label={controlLabel(attributeConfig.name)}
      options={attributeConfig.acValues}
      getOptionLabel={option => option.label}
      fullWidth
      onChange={event => { onListInputChange(event, attributeConfig) }}


      renderInput={(params) => <TextField {...params} variant="outlined" label={controlLabel(attributeConfig.name)} onChange={event => { onTextInputChange(event, attributeConfig) }} />}
      isOptionEqualToValue={(option, value) => option.label == value.label && option.value == value.value}
      value={{ "label": userData.attributes[attributeConfig.name], "value": userData.attributes[attributeConfig.name] }}
    />

  }

  function createCheckTextListInput(attributeConfig) {

    attributeConfig.acValues = [{ "label": "", "value": "" }];

    attributeConfig.values.map(value => {
      attributeConfig.acValues.push({ "label": value.name, "value": value.value });
    });


    // if (userData.attributes[attributeConfig.name] != null && userData.attributes[attributeConfig.name].length > 0 ) {
    //   attributeConfig.enabled = true;
    // } else {
    //   attributeConfig.enabled = false;
    // }


    return <Autocomplete
      key={attributeConfig.name}
      label={controlLabel(attributeConfig.name)}
      options={attributeConfig.acValues}
      getOptionLabel={option => option.label}
      fullWidth
      onChange={event => { onListInputChange(event, attributeConfig) }}
      disabled={! attributeConfig.enabled}

      renderInput={(params) => 
        <React.Fragment>
        <Switch checked={attributeConfig.enabled} onChange={event => {onEnabledCheckboxChanged(event,attributeConfig)} }/>  Enable {controlLabelSimple(attributeConfig.name)}
        <TextField {...params} variant="outlined" label={controlLabel(attributeConfig.name)} onChange={event => { onTextInputChange(event, attributeConfig) }}  disabled={! attributeConfig.enabled} />
        </React.Fragment>
      }
      isOptionEqualToValue={(option, value) => option.label == value.label && option.value == value.value}
      value={{ "label": userData.attributes[attributeConfig.name], "value": userData.attributes[attributeConfig.name] }}
    />

  }


  function createTextButtonInput(attributeConfig) {
    return <Stack><TextField
      label={controlLabel(attributeConfig.name)}
      value={userData.attributes[attributeConfig.name]}
      onChange={event => { onTextButtonInputChange(event, attributeConfig) }}
      multiline={attributeConfig.type == "textarea"}
      rows={20}
      fullWidth
      
      key={attributeConfig.name} /><Button variant="contained" onClick={event => { onButtonClick(attributeConfig,event) }} fullWidth >Lookup</Button></Stack>
  }

  function createTextInput(attributeConfig) {
    return <TextField
      label={controlLabel(attributeConfig.name)}
      value={userData.attributes[attributeConfig.name]}
      onChange={event => { onTextInputChange(event, attributeConfig) }}
      multiline={attributeConfig.type == "textarea"}
      rows={20}
      fullWidth
      key={attributeConfig.name} />
  }

  function createListInput(attributeConfig) {






    return <FormControl fullWidth key={attributeConfig.name}>
      <InputLabel id={attributeConfig.name + "-label"}>{controlLabel(attributeConfig.name)}</InputLabel>
      <Select
        labelId={attributeConfig.name + "-label"}
        id={attributeConfig.name}

        value={userData.attributes[attributeConfig.name]}
        label={controlLabel(attributeConfig.name)}
        onChange={event => {
          onListInputChange(event, attributeConfig);
        }}
      >
        {

          attributeConfig.values.map(val => {

            return <MenuItem key={val.name} selected={val.value == userData.attributes[attributeConfig.name]} value={val.value}>{val.name}</MenuItem>
          })
        }

      </Select>
    </FormControl>
  }

  function displayControl(attributeConfig) {

    switch (attributeConfig.type) {
      case "text": return createTextInput(attributeConfig);
      case "text-button": return createTextButtonInput(attributeConfig);
      case "list": return createListInput(attributeConfig);
      case "textarea": return createTextInput(attributeConfig);
      case "text-list": return createTextListInput(attributeConfig);
      case "text-list-box": return createTextListInput(attributeConfig);
      case "chk-text-list-box": return createCheckTextListInput(attributeConfig);
      default: return "";
    }


  }

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
              { config.headerTitle }
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
            <Stack spacing={2}>
              <Title>{config.frontPage.title}</Title>
              {config.frontPage.text}

              {(submitRequestErrors.length > 0 ?
                <Alert severity="error">
                  <b>There was a problem submitting your request:</b>
                  <ul>
                    {
                      submitRequestErrors.map((msg) => {
                        return <li>{msg}</li>
                      })
                    }
                  </ul>
                </Alert>

                : "")}
              {(submitRequestSuccess > 0 ?
                <Alert severity="success">
                  <b>Your request has been submitted</b>
                </Alert>

                : "")}

              <Grid container spacing={2} >
                {
                  config.attributeNameList.map(key => {
                    return config.attributes[key].show ?


                      <React.Fragment>


                        <Grid item xs={formClass()}>
                          {
                            displayControl(config.attributes[key])
                          }
                        </Grid>
                        

                      </React.Fragment>



                      : ""

                  })
                }

                { config.requireReCaptcha ? 
                <React.Fragment>
                  <Grid item xs={formClass()}>
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={config.rcSiteKey} onChange={event => {
                        
                      }} />
                  </Grid>
                </React.Fragment>
                
                : ""}


                { config.requireTermsAndConditions ? 
                  <React.Fragment>
                    <Grid item xs={formClass()}>
                      <Interweave content={config.termsAndConditionsText	} /> 
                    </Grid>
                    <Grid item xs={formClass()}>
                      <FormControlLabel control={<Checkbox value={userData.checkedTermsAndConditions}  onChange={event => {
                        var localUserData = {...userData}
                        localUserData.checkedTermsAndConditions	= event.target.checked;
                        setUserData(localUserData);

                      }}/>} label="I Accept" />
                    </Grid>
                  </React.Fragment>  
                  
                : "" }

                

                <Grid item xs={12}  >
                  {
                    config.requireReason ?
                      config.reasonIsList ?

                        <FormControl fullWidth>
                          <InputLabel id={"reason-label"}>Reason</InputLabel>
                          <Select
                            labelId="reason-label"

                            defaultValue={config.reasons.length > 0 ? config.reasons[0] : ""}

                            label="Reason"
                            onChange={event => {
                              var luserData = { ...userData };
                              luserData.reason = event.target.value;
                              setUserData(luserData);
                            }}
                          >
                            {

                              config.reasons.map(val => {

                                return <MenuItem key={val} selected={val == userData.reason} value={val}>{val}</MenuItem>
                              })
                            }

                          </Select>
                        </FormControl>

                        :
                        <TextField
                          label="Reason"
                          defaultValue={userData["reason"]}
                          onChange={event => { var luserData = { ...userData }; luserData["reason"] = event.target.value; setUserData(luserData) }}
                          fullWidth />

                      : ""
                  }
                </Grid>
              </Grid>

              <Grid container spacing={2} >
                <Grid item xs={12} md={6} >
                  <Button fullWidth disabled={!saveEnabled} onClick={(event => {
                    setSaveEnabled(false);
                    setDialogTitle("Submitting Request");
                    setDialogText("Submitting your request");

                    setShowDialog(true);


                    config.attributeNameList.map(key => {
                      if (!userData.attributes[key]) {
                        userData.attributes[key] = "";
                      }
                    })

                    if (config.requireReCaptcha) {
                      userData.reCaptchaCode = recaptchaRef.current.getValue();
                      recaptchaRef.current.reset();
                    }




                    const requestOptions = {
                      mode: "cors",
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(userData)
                    };

                    fetch(configData.SERVER_URL + "register/submit", requestOptions)
                      .then(response => {
                        if (response.status == 200) {
                          setSubmitRequestSuccess(true);
                          setShowDialog(false);
                          setSubmitRequestErrors([]);

                          return Promise.resolve({});
                        } else {
                          return response.json();
                        }
                      })
                      .then(data => {
                        if (data.errors) {
                          setSubmitRequestErrors(data.errors);
                          setSaveEnabled(true);
                        }

                        setShowDialog(false);
                      })


                  })} >Save</Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button fullWidth disabled={!saveEnabled}
                    onClick={event => { window.location = config.homeURL; }}

                  >Cancel Request</Button>
                </Grid>
              </Grid>
            </Stack>





            <Copyright sx={{ pt: 4 }} />



          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
