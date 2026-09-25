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
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import configData from './config/config.json'

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

export default function Report(props) {
    
    
    
    
    return (
        <React.Fragment>
            <Stack spacing={1}>
            <h2>{props.report.name}</h2>
            <h3>{props.report.description}</h3>
            {props.report.when}
            <Button
            onClick={(event) => {
                const requestOptions = {
                    mode: "cors",
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(props.report)
                };

                fetch(configData.SERVER_URL + "main/reports/excelx",requestOptions)
                .then((response) => {
                    return response.blob();
                })
                .then((blob) => {
                    
                    
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `${props.report.name}-${props.report.when}.xlsx`);
                    document.body.appendChild(link);
                    link.click();
                    
                    
                    
                });

            }}
            >Export to Excel</Button>
            
            
            
                    
            


            {
                props.report.grouping.map(function(dataset) {
                    
                    for (var i = 0;i<dataset.data.length;i++) {
                        dataset.data[i]["id"] = i;
                        
                    }
                    return <React.Fragment>
                        
                        <Grid container spacing={0}>
                            {props.report.headerFields.map(function (headerField) {
                                return <React.Fragment><Grid item xs={12} md={4} ><b>{headerField}</b></Grid><Grid item xs={12} md={8}>{dataset.header[headerField]}</Grid></React.Fragment>
                            })}
                                                    
                            
                        </Grid>
                        

                        <TableContainer >
                        <Table  aria-label="customized table">
                            <TableHead>
                            <TableRow>
                            {props.report.dataFields.map(function(dataField) {
                               return <StyledTableCell align="left">{dataField}</StyledTableCell> 
                            })}
                                
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {dataset.data.map((row) => (
                                <StyledTableRow key={row.id}>
                                {props.report.dataFields.map(function(dataField) {
                                    return <StyledTableCell>{row[dataField]}</StyledTableCell>
                                })}
                                
                                
                                </StyledTableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </TableContainer>

                        
                    </React.Fragment>
                })
            }
            
            {props.chooseScreenHandler ? <Button onClick={event => {props.chooseScreenHandler('reports')}} >Close Report</Button> : ""}
            </Stack>



                    
                    
                
           
            
               
        
        </React.Fragment>
    );
}