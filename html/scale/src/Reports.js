import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Orgs from './Orgs';
import Links from './Links';
import OrgInfo from './OrgInfo';
import { useEffect, useState } from 'react';
import AccessWorkflows from './AccessWorkflows';
import { TextField } from '@mui/material';
import ReportsList from './ReportsList';
import configData from './config/config.json'

export default function Reports(props) {
    const [reports,setReports] = React.useState({"reports":[]})
    const [currentOrg, setCurrentOrg] = React.useState({});


    function setReportsList(node) {
        fetch(configData.SERVER_URL + "main/reports/org/" + node)
            .then(response => {

                if (response.status == 200) {
                    return response.json();
                } else {
                    return Promise.resolve({"reports":[]});
                }


            })
            .then(data => {
                var reps = data.reports;
                var newReports = { "reports": reps };
                setReports(newReports);
                
            })
    }

    function handleReportOrgClick(event, node) {
        setCurrentOrg(props.orgsById[node]);
        setReportsList(node);

    }

    

    useEffect(() => {
        setCurrentOrg(props.orgs);
        setReportsList(props.orgs.id);
    }, [props.orgs])



    return (
        <React.Fragment>
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
                        <Orgs orgs={props.orgs} config={props.config} flag={'showInReports'} handleOrgClick={handleReportOrgClick} title={props.title} />
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
                
                {/* Recent Orders */}
                <Grid item sm={12}>
                    <ReportsList reports={reports} setReport={props.setReport} chooseScreenHandler={props.chooseScreenHandler} requireUsernameParam={false} userName="" reportState={props.reportState} setReportState={props.setReportState}  />
                </Grid>
            </Grid>
        </React.Fragment>
    );
}