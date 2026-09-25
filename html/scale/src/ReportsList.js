import * as React from 'react';



import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Orgs from './Orgs';
import Links from './Links';
import OrgInfo from './OrgInfo';
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { CardActionArea, CardHeader } from '@mui/material';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Title from './Title';
import { TextField } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import configData from './config/config.json'
import dayjs, { Dayjs } from 'dayjs';

export default function ReportsList(props) {
    const [showSubmitDialog,setShowSubmitDialog] = React.useState(false);
    const [showParamsDialog,setShowParamsDialog] = React.useState(props.reportState && props.reportState.showParamsDialog ? props.reportState.showParamsDialog : false);
    const [selectedReport,setSelectedReport] = React.useState({"parameters":[]});
    
    const [origUserName,setOrigUserName] = React.useState(props.userName);
    const [reportUserName,setReportUserName] = React.useState(props.reportState && props.reportState.userName ? props.reportState.userName : props.userName);
    const [beginDate,setBeginDate] = React.useState(props.reportState && props.reportState.beginDate ? props.reportState.beginDate :  0);
    const [endDate,setEndDate] = React.useState(props.reportState && props.reportState.endDate ? props.reportState.endDate : 0);


    useEffect(() => {
        if (document.visibilityState === "visible") {
            if (props.reportState && props.reportState.report) {
                if (props.reportState.beginDate) {
                    setBeginDate(props.reportState.beginDate);
                }

                if (props.reportState.endDate) {
                    setEndDate(props.reportState.endDate);
                }

                if (props.reportState.reportUserName) {
                    setReportUserName(props.reportState.reportUserName);
                }

                setSelectedReport({...props.reportState.report});
                setShowParamsDialog(true);

                
            }
        }
        
        


    }, []);


    function loadReport(report) {
        setShowSubmitDialog(true);

        // if main report, store the state

        if (props.reportState) {
            const newState = {};
            newState.report = {...report};
            if (beginDate > 0) {
                newState.beginDate = beginDate;
            }

            if (endDate > 0) {
                newState.endDate = endDate;
            }

            if (reportUserName) {
                newState.reportUserName = reportUserName;
            }

            if (props.setReportState) {
                props.setReportState(newState);
            }
        }

        var url = configData.SERVER_URL + "main/reports/" + report.name;
        var params = '';

        if (report.parameters.indexOf("beginDate") >= 0) {
            if (params == '') {
                params = "?";
            } else {
                params = params + "&";
            }

            params = params + "beginDate=" + beginDate;
        }

        if (report.parameters.indexOf("endDate") >= 0) {
            if (params == '') {
                params = "?";
            } else {
                params = params + "&";
            }

            params = params + "endDate=" + endDate;
        }

        if (report.parameters.indexOf("userKey") >= 0) {
            if (params == '') {
                params = "?";
            } else {
                params = params + "&";
            }

            params = params + "userKey=" + reportUserName;
        }

        
        url += params;



        fetch(url)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise({});
            }
        })
        .then((json) => {
            json.when = Date().toLocaleString();
            props.setReport(json);
            setShowSubmitDialog(false);
            props.chooseScreenHandler('report');
        })
    }

    function canSubmitReport() {
        var allCnditionsSet = true;

        if (selectedReport.parameters.indexOf("userKey") >= 0) {
            allCnditionsSet = allCnditionsSet && reportUserName.length > 0;
        }

        if (selectedReport.parameters.indexOf("beginDate") >= 0) {
            allCnditionsSet = allCnditionsSet && beginDate > 0;
        }

        if (selectedReport.parameters.indexOf("endDate") >= 0) {
            allCnditionsSet = allCnditionsSet && endDate > 0;
        }

        return allCnditionsSet;
    }

    function generateReportCard(report) {
        return (<Grid item xs={12} key={report.name} sx={{ mt: 4, mb: 4 }}>
                            <Card variant="outlined" style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: "100%" }}>
                                <CardHeader title={report.name}></CardHeader>
                                <CardContent >

                                    <Typography variant="body1">{report.description}</Typography>


                                </CardContent>
                                <CardActions>
                                    <Button variant="contained" onClick={(event) => {

                                        if (report.parameters.length == 0) {
                                            loadReport(report);
                                        } else {
                                            
                                            setSelectedReport({...report});
                                            setShowParamsDialog(true);
                                        }


                                    }} >Run</Button>


                                </CardActions>
                            </Card>
                        </Grid>);
    }

    return (
        <React.Fragment>
           

           <Dialog
                open={showSubmitDialog}

                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Requesting Report...</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Requesting Report
                        <LinearProgress />
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showParamsDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
            
                <DialogTitle id="alert-dialog-title">Report Parameters</DialogTitle>
                <DialogContent>
                    
                    <Stack spacing={2}>
                        
                        {selectedReport.parameters.indexOf("userKey") >= 0 ? <TextField label="User Name" fullWidth margin="normal" value={reportUserName}  onChange={(event) => {
                            setReportUserName(event.target.value);
                            
                            


                            }}/> : ""}
                        {selectedReport.parameters.indexOf("beginDate") >= 0  ?
                        
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker value={beginDate > 0 ? dayjs(beginDate) : null} label="Begin Date" labelId="begindate-label" onChange={(newValue) => {
                                
                                
                                if (newValue == null) {
                                    setBeginDate(0);
                                    
                                    return;
                                }
                                
                                setBeginDate(newValue.unix() * 1000);
                                
                                
                            }} />
                            </LocalizationProvider>
                        
                        : "" }
                        {selectedReport.parameters.indexOf("endDate") >= 0  ?
                        
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker value={endDate > 0 ? dayjs(endDate) : null}  label="End Date" labelId="begindate-label" onChange={(newValue) => {
                            if (newValue == null) {
                                setEndDate(0);
                                
                                return;
                            }

                            setEndDate(newValue.unix() * 1000);
                            
                            
                        }} />
                        </LocalizationProvider>
                    
                    : "" }
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button disabled={!canSubmitReport()} onClick={(event) => {
                        //setReportUserName(origUserName);
                        //setBeginDate(0);
                        //setEndDate(0);
                        //setShowParamsDialog(false);
                        loadReport(selectedReport);
                        
                    }}>Request Report</Button>
                    <Button onClick={(event) => {
                        setReportUserName(origUserName);
                        setBeginDate(0);
                        setEndDate(0);
                        if (props.setReportState) {
                            if (props.reportState) {
                                props.setReportState({});
                            } else {
                                props.setReportState(null);
                            }
                        }
                        
                        setShowParamsDialog(false);
                    }} autoFocus>
                        Cancel Request
                    </Button>
                </DialogActions>

            </Dialog>

            <Grid container spacing={0}>

                <Grid
                    container
                    spacing={2}
                    direction="row"
                    item sm={12}
                    alignItems="stretch"



                >
                    {props.reports.reports.map(function (report) {

                        if (props.requireUsernameParam) {
                            if (report.parameters.indexOf("userKey") >= 0) {
                                return generateReportCard(report);    
                            }
                        } else {
                            return generateReportCard(report);
                        }
                        
                        






                    })};
                </Grid>

            </Grid>

        </React.Fragment>
    );
}