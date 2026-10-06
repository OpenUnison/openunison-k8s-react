import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import configData from './config/config.json'



function genLinkImage(link) {
    var imgB64Url = "data:image/png;base64," + link.icon;
    return imgB64Url;
}

export default function Links(props) {
    return (
        <React.Fragment>
            <Grid
                container
                spacing={2}
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
               

            >
                {props.links.urls.map(function (link) {
                    return (
                        <Grid item xs={12} sm={6}   lg={4}  key={link.name} sx={{ mt: 4, mb: 4 }}>
                            <Link href={link.url} color="primary" underline="hover" variant='h5' target={link.name} >
                            <Card variant="outlined" >
                                <CardContent style={{ justifyContent: "center", display: "flex" }}>
                                    <img src={genLinkImage(link)} />

                                </CardContent>
                                <CardActions style={{ justifyContent: 'center' }}>
                                    <Link tabIndex="-1" href={link.url} color="primary" underline="hover" variant='h5' target={link.name} >{link.label}</Link>
                                </CardActions>
                            </Card>
                            </Link>
                        </Grid>
                    )
                })}
            </Grid>
        </React.Fragment>
    );
}