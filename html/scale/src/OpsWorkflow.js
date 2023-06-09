import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { CardActionArea, CardHeader } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { TextField } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';


export default function OpsWorkflow(props) {
    const [forceRedraw, setFoceRedraw] = React.useState(Math.random);
    
    const [submitRequestErrors, setSubmitRequestErrors] = React.useState([]);
    const [submitRequestSuccess, setSubmitRequestSuccess] = React.useState([]);
    const [localWf,setLocalWf] = React.useState({...props.wf,"approved":false,"tryPreApprove":false})

    return (
        
                        <Card variant="outlined" style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: "100%" }}>
                            <CardHeader title={localWf.label}></CardHeader>
                            <CardContent >
                                <Stack>
                                    {(submitRequestErrors.length > 0 ?
                                        <Alert severity="error">
                                            <b>There was a problem submitting your requests:</b>
                                            <ul>
                                                {
                                                    submitRequestErrors.map((msg) => {
                                                        return <li>{msg}</li>
                                                    })
                                                }
                                            </ul>
                                        </Alert>

                                        : "")}

                                    {(submitRequestSuccess.length > 0 ?
                                        <Alert severity="success">
                                            <b>Your requests have been submitted:</b>
                                            <ul>
                                                {
                                                    submitRequestSuccess.map((msg) => {
                                                        return <li>{msg}</li>
                                                    })
                                                }
                                            </ul>
                                        </Alert>

                                        : "")}


                                    <Typography variant="body1">
                                        {localWf.description}
                                    </Typography>
                                    {(props.config.requireReasons && !props.config.reasonIsList ? <TextField label="Reason for request" fullWidth margin="normal" onChange={(event) => {  var nwf = {...localWf};  nwf.reason = event.target.value; setLocalWf(nwf)}} /> : "")}
                                    {(props.config.requireReasons && props.config.reasonIsList ?
                                        <FormControl fullWidth>
                                            <InputLabel id="demo-simple-select-label">Reason for request</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"

                                                label="Reason for request"
                                                onChange={event =>{
                                                    var nwf = {...localWf};
                                                    nwf.reason = event.target.value;
                                                }}
                                            >
                                                {

                                                    props.config.reasons.map(function (reason) {

                                                        return <MenuItem value={reason}>{reason}</MenuItem>
                                                    })
                                                }

                                            </Select>
                                        </FormControl>

                                        : "")}



                                    {(localWf.canPreApprove) ?
                                        <FormControlLabel control={<Checkbox checked={localWf.tryPreApprove} value={localWf.tryPreApprove} onClick={event => {  var nwf = {...localWf};  nwf.tryPreApprove = event.target.checked; setLocalWf(nwf); }} />} label="Attempt Pre-approval?" />
                                        : ""}

                                    {(localWf.canPreApprove && localWf.tryPreApprove) ?
                                        <RadioGroup
                                            value={localWf.approved}     
                                            onChange={event => {
                                                var nwf = {...localWf};  nwf.approved = event.target.value;setLocalWf(nwf);
                                            }}
                                            >
                                            <FormControlLabel value={true} control={<Radio value={true} />} label="Approved" />
                                            <FormControlLabel value={false} control={<Radio value={false} />} label="Denied" />
                                        </RadioGroup>
                                        : ""}

                                    {(localWf.canPreApprove && localWf.tryPreApprove) ?
                                        <TextField

                                            label={"Reason for " + (localWf.approved == "true" ? "approval" : "denial")}

                                            defaultValue={localWf.approvalReason}
                                            onChange={event => { var nwf = {...localWf};  nwf.approvalReason = event.target.value; setLocalWf(nwf) }}
                                        />
                                        : ""}

                                    <Button onClick={(event) => {
                                        // show dialog
                                        props.setShowSubmitDialog(true);

                                        // create the payload
                                        var wfRequests = [];
                                                
                                        var wfrequest = {}
                                        wfrequest.uuid = localWf.uuid;
                                        wfrequest.name = localWf.name;
                                        wfrequest.reason = localWf.reason;
                                        wfrequest.subjects = [];

                                        Object.keys(props.cart).map((resultDN) => {
                                            var row = props.cart[resultDN];
                                            wfrequest.subjects.push(row[props.config.uidAttributeName]);
                                        });

                                        if (localWf.tryPreApprove) {
                                            wfrequest.doPreApproval = true;
                                            wfrequest.approved = (localWf.approved ? "true" : "false");
                                            wfrequest.approvalReason = localWf.approvalReason;
                                        }

                                        wfrequest.encryptedParams = localWf.encryptedParams;
                                        wfRequests.push(wfrequest);
                                        
                                        const requestOptions = {
                                            mode: "cors",
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(wfRequests)
                                        };

                                        fetch("https://k8sou.apps.192-168-2-14.nip.io/scalereact/main/workflows", requestOptions)
                                            .then(response => response.json())
                                            .then(data => {
                                                var wfSuccess = [];
                                                var wfError = [];

                                                Object.keys(data).map((wfid) => {
                                                    var result = data[wfid];
                                                    if (result == "success") {
                                                        wfSuccess.push(localWf.label);
                                                        
                                                    } else {
                                                        wfError.push(localWf.label + ' - ' + result);
                                                    }
                                                });


                                        

                                                setSubmitRequestSuccess(wfSuccess);
                                                setSubmitRequestErrors(wfError);
                                                props.setShowSubmitDialog(false);
                                            });
                                    }} disabled={(localWf.tryPreApprove &&  (! localWf.approvalReason || localWf.approvalReason == ""))}>Submit Your Requests</Button>
                                </Stack>



                            </CardContent>
                            <CardActions>



                            </CardActions>
                        </Card>
 






              
    );
}