import * as React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import SummarizeIcon from '@mui/icons-material/Summarize';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import OrgInfo from './OrgInfo';
import { useEffect, useState } from 'react';
import OpsWorkflows from './OpsWorkflows';
import Orgs from './Orgs';

import Alert from '@mui/material/Alert';
import { Checkbox, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import Semaphore from './Semaphore';

import configData from './config/config.json'

export default function Ops(props) {
    const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);
    const [submitRequestErrors, setSubmitRequestErrors] = React.useState([]);
    const [submitRequestSuccess, setSubmitRequestSuccess] = React.useState(false);
    const [selectedBase, setSelectedBase] = React.useState(props.opsConfig.searchBases[0]);


    const [dialogTitle, setDialogTitle] = React.useState("");
    const [dialogText, setDialogText] = React.useState("");
    const [searchResults, setSearchResults] = React.useState([]);
    const [cart, setCart] = React.useState({});

    const [showUserDialog, setShowUserDialog] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState({ metaData: {}, attributes: {}, groups: [] });
    const [currentUserAttribs, setCurrentUserAttribs] = React.useState({});


    const [workflows, setWorkflows] = React.useState({ wfs: [] })
    const [visibleWorkflows, setVisibleWorkflows] = React.useState({ wfs: [] })
    const [annotationFilters,setAnnotationFilters] = React.useState({});
    const [selectedFilters,setSelectedFilters] = React.useState({});
    const [filter, setFilter] = React.useState("");
    const [currentOrg, setCurrentOrg] = React.useState({});

    const [forceRedraw,setForceRedraw] = React.useState(Math.random);

    const [semaphore, setSemaphore] = React.useState(new Semaphore(10));
    
    const [showLoadDialog,setShowLoadDialog] = React.useState(false);

    var searchAttrs = {}
    props.opsConfig.searchableAttributes.map(attrCfg => {
        searchAttrs[attrCfg.name] = { ...attrCfg }
    })


    const [searchAttributes, setSearchAttributes] = React.useState(searchAttrs)


    function updateCart(event, wf) {

       
    }


    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    const fetchDelegate = async(url,wf) => {
        const controller = semaphore.getAbortController(); // Get AbortController for cancellation
        const options = {"signal" : controller.signal}; // Attach signal to the fetch options

        await semaphore.acquire();
        
        try {
        
        const response = await fetch(url,options)
        
            .then(response => {
            return response.json();
            })
            .then(json => {
                wf.canPreApprove = json.canPreApprove;
                wf.canDelegate = json.canDelegate;

                if (wf.canPreApprove) {
                    wf.tryPreApprove = props.opsConfig.approveChecked;
                    wf.showPreApprove = props.opsConfig.showPreApprove;

                    wf.approvedLabel = props.opsConfig.approvedLabel;
                    wf.deniedLabel = props.opsConfig.deniedLabel;
                    wf.reasonApprovedLabel = props.opsConfig.reasonApprovedLabel;
                    wf.reasonDeniedLabel = props.opsConfig.reasonDeniedLabel;
                }

                //setForceRedraw(Math.random)
            })
        } catch (err) {
            if (err.name === 'AbortError') {
                console.error('Fetch aborted:', url);
              } else {
                console.error('Fetch error:', err);
              }
        } finally {
            semaphore.release();
        }
    }

    const fetchWorkflows = async(node) => {
        
        fetch(configData.SERVER_URL + "main/workflows/org/" + node)
            .then(response => {

                if (response.status == 200) {
                    return response.json();
                } else {
                    return Promise.resolve([]);
                }


            })
            .then(async(data) => {
                var wfs = data;
                
                
                wfs.map(wf => {
                    fetchDelegate(configData.SERVER_URL + "main/workflows/candelegate?workflowName=" + wf.name + "&uuid=" + wf.uuid,wf);
                });

                semaphore.waitUntilEmpty().then(x => {
                    setShowLoadDialog(false);   
                    
                });
                
                
                var newLinks = { "wfs": wfs };

                var wfAnnotations = {};

                wfs.map(wf => {
                    Object.keys(wf.filterAnnotations).map(annotationLabel => {
                        var vals = wfAnnotations[annotationLabel];
                        if (vals) {
                            if (! vals.includes(wf.filterAnnotations[annotationLabel])) {
                                vals.push(wf.filterAnnotations[annotationLabel]);
                                vals.sort();
                            }
                        } else {
                            vals = ["",wf.filterAnnotations[annotationLabel]];
                            wfAnnotations[annotationLabel] = vals;
                        }
                    })
                })

                

                setAnnotationFilters(wfAnnotations);

                setWorkflows(newLinks);
                setVisibleWorkflows(newLinks);
                setFilter("");
                
            })
    }

    const handleRequestAccessOrgClick = async(event, node) => {
        setCurrentOrg(props.orgsById[node]);
        setShowLoadDialog(true);
        await fetchWorkflows(node);
        

    }

    function onWokrlfowChange(event) {

        filterWorkflows(event.target.value,selectedFilters);
    }

    const handelCancel = async() => {
        semaphore.cancelAll();
        await semaphore.waitUntilEmpty();
        setShowLoadDialog(false);
    }

    function filterWorkflows(filterValue,filterAnnotations) {
        if (! filterAnnotations) {
            filterAnnotations = {};
        }
        setFilter(filterValue);


        var newVisibleWfs = { wfs: [] };
        workflows.wfs.map((wf) => {


            if (filterValue == '' || wf.label.includes(filterValue)) {

                var matchFilters = true;

                Object.keys(filterAnnotations).map(annotationLabel => {
                    if (filterAnnotations[annotationLabel] != '') {
                        matchFilters = matchFilters && (wf.filterAnnotations[annotationLabel] == filterAnnotations[annotationLabel]);
                    }
                });

                if (matchFilters) {
                    newVisibleWfs.wfs.push(wf);
                }
            }
        });

        setVisibleWorkflows(newVisibleWfs);
    }

    function displayName(config, user) {
        for (var i = 0; i < user.attributes.length; i++) {
            if (user.attributes[i].name == config.displayNameAttribute) {
                return user.attributes[i].values[0];
            }
        }
    }

    function showUserAttributes() {
        if (currentUser.canEditUser) {
            return <Stack spacing={0}>

                {(submitRequestErrors.length > 0 ?
                    <Alert severity="error">
                        <b>There was a problem submitting {displayName(props.config, currentUser)}'s profile update:</b>
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
                        <b>{displayName(props.config, props.user)}'s profile update has been submitted</b>
                    </Alert>

                    : "")}

                {Object.keys(currentUser.metaData).map(function (attrName) {
                    var attribute = currentUser.attributes[attrName]




                    return <TextField id={attrName}
                        key={attrName}
                        label={currentUser.metaData[attrName].displayName}
                        disabled={currentUser.metaData[attrName].readOnly}
                        fullWidth
                        margin="normal"
                        defaultValue={currentUserAttribs[attrName]}
                        onChange={(event) => { currentUserAttribs[attrName] = event.target.value; }}


                    />
                }
                )}
                <Button onClick={(event => {
                    setShowSubmitDialog(true);

                    var newAttributes = {};
                    Object.keys(currentUserAttribs).map(attrName => {
                        alert(attrName);
                        if (currentUser.metaData[attrName] && !currentUser.metaData[attrName].readOnly) {
                            newAttributes[attrName] = {

                                "name": attrName,
                                "value": currentUserAttribs[attrName]
                            }
                        }
                    });


                    const requestOptions = {
                        mode: "cors",
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newAttributes)
                    };

                    fetch(configData.SERVER_URL + "ops/user", requestOptions)
                        .then(response => {
                            if (response.status == 200) {
                                setSubmitRequestSuccess(true);
                                setShowSubmitDialog(false);
                                setSubmitRequestErrors([]);

                                return Promise.resolve({});
                            } else {
                                return response.json();
                            }
                        })
                        .then(data => {
                            if (data.errors) {
                                setSubmitRequestErrors(data.errors);
                                setShowSubmitDialog(false);
                            }
                        })


                })} >Save</Button>
            </Stack>
        } else {
            return <Grid container spacing={1} >
                {Object.keys(currentUser.metaData).map(attributeName => {
                    
                    var attribute = currentUserAttribs[attributeName]
                    return <React.Fragment><Grid item xs={12} md={12} ><b>{currentUser.metaData[attributeName].displayName}</b></Grid><Grid item xs={12} md={12} zeroMinWidth><Typography style={{ overflowWrap: 'break-word' }}>{attribute}</Typography></Grid></React.Fragment>
                }
                )}
            </Grid>
        }
    }



    return (
        <React.Fragment>
            
            <Dialog
                open={showSubmitDialog}

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
            </Dialog>

            <Dialog
                open={showLoadDialog}

                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Loading Workflows</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Verifying Permissions
                        <LinearProgress />
                    </DialogContentText>
                    <DialogActions>
                        <Button onClick={handelCancel}>Cancel</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showUserDialog}
                maxWidth={props.opsConfig.maxWidth}
                fullWidth={true}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >

                <DialogContent>
                    <Stack>
                        <Grid container
                            direction="row"
                        >

                            {/* attributes */}
                            <Grid item xs={12} sm={props.opsConfig.attributesWidth} >
                                <h3>Attributes</h3>
                                {showUserAttributes()}
                            </Grid>

                            {/* groups */}
                            <Grid item xs={12} sm={props.opsConfig.rolesWidth} >
                                <h3>Roles</h3>
                                { props.config.groupsAreJson && currentUser.groups.length > 0 ? 
                    
                        <TableContainer>
                            <Table aria-label="group table">
                                <TableHead>
                                    <TableRow key="header">
                                        {
                                            props.config.groupsFields.map(header => {
                                                return <StyledTableCell key={header} align="left">{header}</StyledTableCell>
                                            }

                                            )
                                        }
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        JSON.parse(currentUser.groups[0]).map(tblrow => {
                                            return  <StyledTableRow>
                                                        {
                                                            props.config.groupsFields.map(header => {
                                                                return <StyledTableCell>{tblrow[header]}</StyledTableCell>
                                                            })
                                                        }
                                                    </StyledTableRow>
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>

                    :
                        <List>
                    {currentUser.groups.map(function (group) {
                        return (
                            <ListItemText key={group}>
                                <Card variant="outlined" >
                                    <CardContent style={{ justifyContent: "left", display: "flex" }}>{group}</CardContent>

                                </Card>
                            </ListItemText>
                        );
                    })}
                </List>
                    }
                            </Grid>

                        </Grid>
                        <Button onClick={event => { setShowUserDialog(false); setCurrentUser({ metaData: {}, attributes: {}, groups: [] }); setCurrentUserAttribs({}) }}>Close</Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            <Stack spacing={(2)}>
                <h2>{props.config.frontPage.title}</h2>
                {props.config.frontPage.text}
                <FormControl fullWidth>
                    <InputLabel id="searchBaseLabel">Search Base</InputLabel>
                    <Select
                        labelId="searchBaseLabel"
                        id="searchBase"
                        value={selectedBase}
                        label="Search Base"
                        onChange={event => {
                            setSelectedBase(event.target.value)
                        }}

                    >
                        {

                            props.opsConfig.searchBases.map(function (base) {

                                return <MenuItem key={base} value={base}>{base}</MenuItem>
                            })
                        }

                    </Select>
                </FormControl>
                <Grid container alignContent="center" alignItems="center">
                    {props.opsConfig.searchableAttributes.map(attrCfg => {
                        return <Grid item xs={12} md={3} key={attrCfg.name} alignItems="center" alignContent="center" display="flex">
                            <Checkbox checked={searchAttributes[attrCfg.name].picked} onClick={event => {  var localSearchAttrs = { ...searchAttributes }; localSearchAttrs[attrCfg.name].picked = event.target.checked; setSearchAttributes(localSearchAttrs); }} />
                            <TextField label={searchAttributes[attrCfg.name].label} margin="normal" value={searchAttributes[attrCfg.name].value} onChange={(event) => { var localSearchAttrs = { ...searchAttributes }; localSearchAttrs[attrCfg.name].value = event.target.value; setSearchAttributes(localSearchAttrs); }} />
                        </Grid>
                    })

                    }
                </Grid>
                <Button onClick={event => {
                    setDialogTitle("Searching for users");
                    setDialogText("Searching...");
                    setShowSubmitDialog(true);

                    var searchAttrs = {};
                    searchAttrs["base"] = selectedBase;
                    searchAttrs["toSearch"] = [];

                    Object.keys(searchAttributes).map(attrName => {
                        if (searchAttributes[attrName].picked) {
                            searchAttrs["toSearch"].push(searchAttributes[attrName])
                        }
                    })



                    const requestOptions = {
                        mode: "cors",
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(searchAttrs)
                    };

                    fetch(configData.SERVER_URL + "ops/search", requestOptions)
                        .then(response => response.json())
                        .then(data => {
                            setSearchResults(data);
                            setShowSubmitDialog(false);
                        }
                        );

                }} >Search</Button>
                {searchResults.length > 0 ? <React.Fragment><h3>Search Results</h3>

                    <TableContainer >
                        <Table aria-label="customized table">
                            <TableHead>
                                <TableRow key="header">
                                    <StyledTableCell align="left"></StyledTableCell>
                                    {props.opsConfig.resultsAttributes.map(attrCfg => {
                                        return <StyledTableCell key={attrCfg.label} align="left">{attrCfg.label}</StyledTableCell>
                                    })}

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {searchResults.map((row) => (
                                    <StyledTableRow key={row[props.config.uidAttributeName]}>
                                        <StyledTableCell align="left"><Button onClick={event => {
                                            var newCart = { ...cart }
                                            if (cart[row.dn]) {
                                                delete newCart[row.dn];
                                            } else {
                                                newCart[row.dn] = { ...row };
                                            }

                                            setCart(newCart);
                                        }}>{cart[row.dn] ? "Remove From Cart" : "Add to Cart"}</Button></StyledTableCell>
                                        {props.opsConfig.resultsAttributes.map(attrCfg => {
                                            return <StyledTableCell key={attrCfg.name}>
                                                <Link href="#" onClick={event => {
                                                    fetch(configData.SERVER_URL + "ops/user?dn=" + encodeURIComponent(row.dn))
                                                        .then(response => response.json())
                                                        .then(data => {
                                                            setCurrentUser({ ...data });
                                                            var userAttrs = {};
                                                            data.attributes.map(attribute => {
                                                                userAttrs[attribute.name] = attribute.values[0];
                                                            });
                                                            setCurrentUserAttribs(userAttrs);
                                                            setShowUserDialog(true);

                                                        }
                                                        );
                                                }}>
                                                    {row[attrCfg.name]}
                                                </Link>
                                            </StyledTableCell>
                                        })}


                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>





                </React.Fragment> : ""}
                {Object.keys(cart).length > 0 ?
                    <React.Fragment>
                        <h3>Cart</h3>
                        <TableContainer >
                            <Table aria-label="customized table">
                                <TableHead>
                                    <TableRow key="header">
                                        <StyledTableCell align="left"></StyledTableCell>
                                        {props.opsConfig.resultsAttributes.map(attrCfg => {
                                            return <StyledTableCell key={attrCfg.label} align="left">{attrCfg.label}</StyledTableCell>
                                        })}

                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(cart).map((resultDN) => {
                                        var row = cart[resultDN];
                                        return <StyledTableRow key={row[props.config.uidAttributeName]}>
                                            <StyledTableCell align="left"><Button onClick={event => {
                                                var newCart = { ...cart }
                                                if (cart[row.dn]) {
                                                    delete newCart[row.dn];
                                                } else {
                                                    newCart[row.dn] = { ...row };
                                                }

                                                setCart(newCart);
                                            }}>{cart[row.dn] ? "Remove From Cart" : "Add to Cart"}</Button></StyledTableCell>
                                            {props.opsConfig.resultsAttributes.map(attrCfg => {
                                                return <StyledTableCell key={attrCfg.name}>
                                                    <Link href="#" onClick={event => {
                                                        fetch(configData.SERVER_URL + "ops/user?dn=" + encodeURIComponent(row.dn))
                                                            .then(response => response.json())
                                                            .then(data => {
                                                                setCurrentUser({ ...data });
                                                                var userAttrs = {};
                                                                data.attributes.map(attribute => {
                                                                    userAttrs[attribute.name] = attribute.values[0];
                                                                });
                                                                setCurrentUserAttribs(userAttrs);
                                                                setShowUserDialog(true);

                                                            }
                                                            );
                                                    }}>
                                                        {row[attrCfg.name]}
                                                    </Link>
                                                </StyledTableCell>
                                            })}


                                        </StyledTableRow>
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Grid container spacing={0}>
                            {/* Chart */}

                            <Grid item xs={12} md={7} lg={8}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: 240
                                    }}
                                >
                                    <Orgs orgs={props.orgs} config={props.config} flag={'showInRequest'} handleOrgClick={handleRequestAccessOrgClick} title={props.title} />
                                </Paper>
                            </Grid>
                            {/* Recent Deposits */}

                            <Grid item xs={12} md={5} lg={4} >
                                <Paper
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: 240
                                    }}
                                >
                                    <OrgInfo org={currentOrg} />
                                </Paper>
                            </Grid>
                            <Grid item sm={12}>
                                <TextField label="Filter by label" fullWidth margin="normal" onChange={(event) => onWokrlfowChange(event)} value={filter} />
                            </Grid>

                            {
                                Object.keys(annotationFilters).map(annotationLabel => {
                                    return  <Grid item sm={12} md={4}>
                                                <FormControl fullWidth>
                                                    <InputLabel id="label-annotation-{annotationLabel}">{annotationLabel}</InputLabel>
                                                    <Select
                                                        labelId="label-annotation-{annotationLabel}"
                                                        id="select-annotation-{annotationLabel}"

                                                        label={annotationLabel}
                                                        onChange={event =>{
                                                            var lselectedfilters = {...selectedFilters};
                                                            lselectedfilters[annotationLabel] = event.target.value;
                                                            setSelectedFilters(lselectedfilters);
                                                            filterWorkflows(filter,lselectedfilters);
                                                        }}
                                                    >
                                                        {

                                                            annotationFilters[annotationLabel].map(function (label) {

                                                                return <MenuItem value={label}>{label}</MenuItem>
                                                            })
                                                        }

                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                })
                            }

                            {/* Recent Orders */}
                            <Grid item sm={12}>
                            <OpsWorkflows access={visibleWorkflows}  cart={cart} config={props.config} />
                            </Grid>
                        </Grid>
                    </React.Fragment>
                    : ""
                }

            </Stack>

        </React.Fragment>
    );
}
