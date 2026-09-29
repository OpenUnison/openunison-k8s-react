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
import NavList from './NavList.js'
import theme from './theme';
import FrontPage from './FrontPage';
import RequestAccess from './RequestAccess.js';
import User from './User'
import { useEffect, useState, useReducer, useRef } from 'react';
import { loadAttributes } from './tools/biz.js'
import CheckOut from './CheckOut.js';
import Approvals from './Approvals.js';
import Approval from './Approval.js';
import Reports from './Reports.js';
import Report from './Report.js';
import Ops from './Ops.js';
import configData from './config/config.json'
import Button from '@mui/material/Button';

import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { visuallyHidden } from '@mui/utils';

import { red } from '@mui/material/colors';


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

  const formatPageTitle = (str) => {
    return str
      .replace(/-/g, " ") // replace all "-" with spaces
      .split(" ")         // split into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
      .join(" ");         // join back into a string
  }

  const chooseScreenHandler = (screenName) => {
    setPageName(screenName);
    document.title = config.headerTitle + ' - ' + formatPageTitle(screenName);
  }

  const [config, setConfig] = React.useState({"headerTitle": "OpenUnison"});
  const [user, setUser] = React.useState({});
  const [userObj, setUserObj] = React.useState({ "currentGroups": [], "attributes": {} })
  const [orgs, setOrgs] = React.useState({});
  const [links, setLinks] = React.useState({ "urls": [] })
  const [cart, setCart] = React.useState({})
  const [orgsById, setOrgsById] = React.useState({})
  const [approvals, setApprovals] = React.useState({ "open": [] });
  const [currentApproval, setCurrentApproval] = React.useState({});
  const [report, setReport] = React.useState({});
  const [enableOps, setEnableOps] = React.useState(false);
  const [opsConfig, setOpsConfig] = React.useState({});

  const [orgsForLinks, setOrgsForLinks] = React.useState({});
  const [orgsForLinksById, setOrgsForLinksById] = React.useState({});


  const [dialogTitle, setDialogTitle] = React.useState("Loading");
  const [dialogText, setDialogText] = React.useState("Connecting to OpenUnison");
  const [dialogButtonLabel,setDialogButtonLabel] = React.useState("OK");
  const [dialogButtonFunction,setDialogButtonFunction] = React.useState(function() {});
  const [showDialog, setShowDialog] = React.useState(true);
  const [showDialogButton, setShowDialogButton] = React.useState(false);

  const [ouTheme,setOuTheme] = React.useState(theme);
  const [loadedStatus,setLoadedStatus] = React.useState("");

  const [reportState,setReportState] = React.useState({});

  function addWorkflowToCart(wf) {
    var newCart = { ...cart }

    fetch(configData.SERVER_URL + "main/workflows/candelegate?workflowName=" + wf.name + "&uuid=" + wf.uuid)
      .then(response => {
        return response.json();
      })
      .then(json => {
        wf.canPreApprove = json.canPreApprove;
        wf.canDelegate = json.canDelegate;

        if (wf.canDelegate && wf.canPreApprove) {
          wf.showPreApprove = true;
          wf.approvedLabel = "Approved";
          wf.deniedLabel = "Denied";
          wf.reasonApprovedLabel = "Reason for approval";
          wf.reasonDeniedLabel = "Reason for denial";
        }
        newCart[wf.uuid] = wf;
        setCart(newCart);
      })



  }

  function removeWorkflowFromCart(wf) {
    var newCart = { ...cart }
    delete newCart[wf.uuid];
    setCart(newCart);
  }

  function removeWorkflowsFromCart(wfs) {
    var newCart = { ...cart }
    for (var i = 0;i<wfs.length;i++) {
      delete newCart[wfs[i].uuid];
    }
    
    setCart(newCart);
  }

  function replaceWorkflowInCart(wf) {
    var newCart = { ...cart }
    newCart[wf.uuid] = wf;
    setCart(newCart);
  }

  function loadOpenApprovals() {
    fetch(configData.SERVER_URL + "main/approvals")
      .then(response => {
        return response.json();
      })
      .then(dataApprovals => {
        var newApprovals = {};


        newApprovals["open"] = dataApprovals.approvals.sort(
          (a, b) => {
            return (a.approvalStart - b.approvalStart);
          }
        );


        var approvalNumbers = {};
        var clearedApprovals = [];

        newApprovals["open"].map(approval => {
          if (! approvalNumbers[approval.approval.toString()]) {
            clearedApprovals.push(approval);
            approvalNumbers[approval.approval.toString()] = "x";
          }
        })

        newApprovals["open"] = clearedApprovals;

        setApprovals(newApprovals);
      });
  }

  function extendSession() {
    fetch(configData.SERVER_URL + "main/config")
      .then(response => {
        if (! response.ok) {
          
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

    fetch(configData.SERVER_URL + "ops/config")
      .then(response => {
        setEnableOps(response.ok);
        if (response.ok) {
          return response.json();
        } else {
          return Promise.resolve({});
        }
      })
      .then(data => {
        
        setOpsConfig(data);
      });


    fetch(configData.SERVER_URL + "main/config")
      .then(response => {
        return response.json()
      })
      .then(dataConfig => {
        setConfig(dataConfig);
        document.title = dataConfig.headerTitle;
        fetch(configData.SERVER_URL + "main/user")
          .then(response => {
            return response.json()
          })
          .then(data => {
            setUser(data);
            var localUserObj = { "currentGroups": [], "attributes": {} };
            loadAttributes(localUserObj, data, dataConfig);
            setUserObj(localUserObj);

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
                  }
                },
                MuiListItemButton: {
                  styleOverrides: {
                    root: {
                      '&.Mui-selected': {
                        outline: '2px solid ' + dataConfig.themePrimaryMain, // Add a 2px solid blue outline
                        outlineOffset: "-2px",
                        // You can also customize other styles for the selected state here
                        // e.g., backgroundColor: 'lightblue',
                      },
                      ':hover': {
                          outline: '2px solid #595959', // Add a 2px solid blue outline
                          outlineOffset: "-2px",
                          // You can also customize other styles for the selected state here
                          // e.g., backgroundColor: 'lightblue',
                        },
                    },
                  },
                },
                MuiTreeItem: {
                  styleOverrides: {
                    root: {
                      '& .MuiTreeItem-content': {
                        '&.Mui-selected': {
                          outline: '2px solid ' + dataConfig.themePrimaryMain, // Add a 2px solid blue outline
                          outlineOffset: "-2px",
                          // You can also customize other styles for the selected state here
                          // e.g., backgroundColor: 'lightblue',
                        },
                        ':hover': {
                          outline: '2px solid #595959', // Add a 2px solid blue outline
                          outlineOffset: "-2px",
                          // You can also customize other styles for the selected state here
                          // e.g., backgroundColor: 'lightblue',
                        },
                    },
                    },
                  },
                },
              },
            });

            setOuTheme(deftheme);
            
            


            if (!dataConfig.showPortalOrgs) {
              // load the URLS, but still need the orgs
              fetch(configData.SERVER_URL + "main/urls")
                .then(
                  response => {
                    return response.json()
                  }
                ).then(
                  dataLinks => {
                    setLinks({ "urls": dataLinks });

                    setPageName(dataConfig.startPage);
                    setShowDialog(false);
                    setLoadedStatus("Page loaded and ready");
                  }
                )

              // even if the portal screen doesn't have orgs, still need to load them
              fetch(configData.SERVER_URL + "main/orgs")
                .then(response => {
                  return response.json()
                })
                .then(dataOrgs => {
                if (dataConfig.enableApprovals) {
                  function loadLeaf(root, llocalOrgsById) {
                    llocalOrgsById[root.id] = root;
                    for (var i = 0; i < root.subOrgs.length; i++) {
                      loadLeaf(root.subOrgs[i], llocalOrgsById);
                    }
                  }

                  
                  var localOrgsById = {};

                  loadLeaf(dataOrgs, localOrgsById);

                  setOrgsById(localOrgsById);
                  setOrgs(dataOrgs);
              }});
            } else {
              // load the orgs and links per org

              fetch(configData.SERVER_URL + "main/orgs")
                .then(response => {
                  return response.json()
                })
                .then(dataOrgs => {


                  function loadLeaf(root, llocalOrgsById) {
                    llocalOrgsById[root.id] = root;
                    for (var i = 0; i < root.subOrgs.length; i++) {
                      loadLeaf(root.subOrgs[i], llocalOrgsById);
                    }
                  }

                  
                  var localOrgsById = {};

                  loadLeaf(dataOrgs, localOrgsById);



                  // load URLs to sort into orgs

                  fetch(configData.SERVER_URL + "main/urls")
                    .then(
                      response => {
                        return response.json()
                      }
                    ).then(
                      dataLinks => {

                        var linkOrgs = JSON.parse(JSON.stringify(dataOrgs));
                        var linksByOrg = {};
                        dataLinks.map(url => {
                          if (!linksByOrg[url.org]) {
                            linksByOrg[url.org] = [];
                          }

                          linksByOrg[url.org].push(url)
                        })

                        function cleanTree(root) {
                          var toRemove = {};
                          var foundLinks = false;
                          root.subOrgs.map(childOrg => {
                            var hasChildren = false;
                            for (var i=0;i<childOrg.subOrgs.length;i++) {
                              if (childOrg.subOrgs[i].showInPortal) {
                                hasChildren = true;
                                
                              }
                            }

                            if (! hasChildren) {
                              childOrg.subOrgs = [];
                            }
                            
                            
                            childOrg.links = linksByOrg[childOrg.id];
                            var hasLinks = childOrg.links && childOrg.links.length > 0;
                            if (!hasLinks) {
                              childOrg.links = [];
                            } else {
                              foundLinks = true;
                            }

                            if (!hasChildren && !hasLinks) {
                              toRemove[childOrg.id] = childOrg;
                            } else {
                              if (cleanTree(childOrg) && ! foundLinks) {
                                toRemove[childOrg.id] = childOrg;
                              }
                            }





                          }

                          );
                          root.subOrgs = root.subOrgs.filter(subOrg => { return !toRemove[subOrg.id] })
                          return (root.subOrgs.length == 0);
                        }

                        cleanTree(linkOrgs);

                        linkOrgs.links = linksByOrg[linkOrgs.id];
                        if (!linkOrgs.links) {
                          linkOrgs.links = [];
                        }

                        var localLinkOrgsById = {};
                        loadLeaf(linkOrgs, localLinkOrgsById);
                        

                        setOrgsForLinks(linkOrgs);
                        setOrgsForLinksById(localLinkOrgsById);
                        setPageName(dataConfig.startPage);
                        setShowDialog(false);
                        setLoadedStatus("Page loaded and ready");
                      }
                    )

                  setOrgsById(localOrgsById);
                  setOrgs(dataOrgs);

                });
            }

            if (dataConfig.enableApprovals) {
              loadOpenApprovals();
            }

          })
      })
  }



  useInterval(() => {


    
    
    // fetch(configData.SERVER_URL + "sessioncheck")
    //   .then(response => {
    //     if (response.status == 200) {
    //       return response.json();
    //     } else {
    //       return Promise.resolve({ "minsLeft": 0 });
    //     }
    //   })
    //   .then(data => {
        
    //     if (pageName != 'loading') {
          
    //       if (data.minsLeft <= 0) {
    //         // need to refresh
    //         // warn the user
    //         setDialogTitle("Session Timeout");
    //         setDialogText("Your session has timed out, hit OK to log back in");
            
    //         setShowDialog(true);
    //         setLoadedStatus("Session has timed out");
    //         setShowDialogButton(true);
    //       } else if (data.minsLeft < config.warnMinutesLeft) {
            
    //         // warn the user
    //         setDialogTitle("Session Timeout Warning");
    //         setDialogText("Warning, your session will timeout in " + data.minsLeft + " minutes, hit OK to continue your session");
            
    //         setShowDialog(true);
    //         setShowDialogButton(true);
    //         setLoadedStatus("Warning, your session will timeout in " + data.minsLeft + " minutes");
    //       } else {
    //         setShowDialog(false);
    //         setShowDialogButton(false);
    //         setLoadedStatus("Page loaded and ready");
    //       }
    //     }
    //   })

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
              { dialogButtonLabel }
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
              aria-hidden={open}
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
            <IconButton onClick={toggleDrawer} aria-expanded="Hides your logo and the menu labels to provide more room for your work on the screen" aria-hidden={!open}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider area-hidden="true" />

          <NavList user={user} config={config} userObj={userObj} chooseScreenHandler={chooseScreenHandler} pageName={pageName} cart={cart} approvals={approvals} enableOps={enableOps} />


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




            {pageName == 'front-page' ? (<FrontPage orgs={orgsForLinks} config={config} links={links} title={config.frontPage.title} orgsById={orgsForLinksById}  />) : ("")}
            {pageName == 'user' ? (<User config={config} user={user} userObj={userObj} />) : ("")}
            {pageName == 'request-access' ? (<RequestAccess config={config} user={user} userObj={userObj} orgs={orgs} title={"Request Access"} addWorkflowToCart={addWorkflowToCart}  removeWorkflowFromCart={removeWorkflowFromCart} cart={cart} orgsById={orgsById} />) : ("")}
            {pageName == 'checkout' ? (<CheckOut cart={cart} config={config} removeWorkflowFromCart={removeWorkflowFromCart} replaceWorkflowInCart={replaceWorkflowInCart} removeWorkflowsFromCart={removeWorkflowsFromCart} setLoadedStatus={setLoadedStatus}/>) : ""}
            {pageName == 'approvals' ? (<Approvals approvals={approvals} setCurrentApproval={setCurrentApproval} chooseScreenHandler={chooseScreenHandler} setLoadedStatus={setLoadedStatus} />) : ""}
            {pageName == 'current-approval' ? (<Approval currentApproval={currentApproval} loadOpenApprovals={loadOpenApprovals} config={config} setLoadedStatus={setLoadedStatus} />) : ""}
            {pageName == 'reports' ? (<Reports reportState={reportState} setReportState={setReportState} config={config} user={user} userObj={userObj} orgs={orgs} title={"Reports"} orgsById={orgsById} setReport={setReport} chooseScreenHandler={chooseScreenHandler} />) : ("")}
            {pageName == 'report' ? (<Report config={config} user={user} userObj={userObj} report={report} chooseScreenHandler={chooseScreenHandler} />) : ""}
            {pageName == 'ops' ? (<Ops config={config} user={user} userObj={userObj} opsConfig={opsConfig} orgs={orgs} orgsById={orgsById} setLoadedStatus={setLoadedStatus} />) : ""}





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
