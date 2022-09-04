import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    unzipSlackExportFiles,
} from './utility.js';
import { Button, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
const useStyles = makeStyles(theme => ({
    root :{
        display : 'flex',
        justifyContent : 'center',
        alignItems : 'center',
        height : '100vh',
        '& a' : {
            color : '#1164A3',
            textDecoration : 'none',
        }
    },
    input : {
        display : 'none',
    },
    container : {
        display : 'flex',
        flexDirection : 'column',
        justifyContent : 'center',
        alignItems : 'center',
        gap : 24,
    },
    commandTitle : {
        display : 'flex',
        justifyContent : 'space-between',
        marginBottom : 4,
        '& span' : {
            cursor : 'pointer',
        }
    },
    code : {
        maxWidth : 480,
        overflowX : 'auto',
        display: 'block',
        backgroundColor : '#2c3e50',
        color : '#fff',
        padding : 8,
        borderRadius : 8,
        position : 'relative',
    },
    loading : {
        position : 'fixed',
        top : 0,
        left : 0,
        right : 0,
        bottom : 0,
        display : 'flex',
        justifyContent : 'center',
        alignItems : 'center',
    }
}));


export default function Import(props) {
    const {
        changeSlackData,
        isCors,
        initComplete,
    } = props;
    const classes = useStyles();
    const loadSlackZipFile = (event) => {
        unzipSlackExportFiles(event, changeSlackData);
    }
    const [commands, setCommands] = React.useState([{
        type   : 'Windows OS',
        line   : '[PATH_TO_CHROME]\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=~/chromeTemp',
        isCopy : false,
    },{
        type   : 'Mac OS',
        line   : 'open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security',
        isCopy : false,
    }]);
    const resetCommands = () => {
        setCommands(commands.map(command => {
            return {
                ...command,
                isCopy : false,
            }
        }));
    }
    const copyClipboard = (type) => (event) => {
        window.navigator.clipboard.writeText(commands.find(command => command.type === type).line)
            .then(() => {
                console.log("Command copied to clipboard");
                setCommands(commands.map(command => {
                    return {
                        ...command,
                        isCopy : command.type === type,
                    }
                }));
                setTimeout(()=>resetCommands(), 1000);
            })
            .catch(err => {
                console.log('Something went wrong', err);
            })
    }
    if(!initComplete){
        return (
            <div className={classes.loading}>
                <CircularProgress />
            </div>
        )
    }
    return (
        <div className={classes.root}>

            <input
                accept="application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip"
                className={classes.input}
                id="contained-button-file"
                multiple
                type="file"
                onChange={loadSlackZipFile}
            />
            <div className={classes.container}>
                <label htmlFor="contained-button-file">
                    <Button 
                        variant="contained" 
                        size="large" 
                        color="primary" 
                        component="span"
                        startIcon={<i className="fas fa-file-import" style={{fontSize : 14}}></i>}
                    >
                    Import Slack zip file
                    </Button>
                </label>
                {
                    isCors ? (
                        <Alert severity="warning">
                            <strong>Cross-Origin Resource Sharing error</strong>
                            <p>
                                If you want to store images and files in the database, you need to avoid CORS errors.
                            </p>

                            <ol type='a'>
                                <li>
                                    <p><strong>Launch browser with CORS error disabled</strong></p>
                                    <p>Execute the following command in the terminal</p>
                                    <pre>
                                        {
                                            commands.map(command => {
                                                const {
                                                    type,
                                                    line,
                                                    isCopy,
                                                } = command;
                                                return (
                                                    <>
                                                        <p className={classes.commandTitle}>
                                                        {type} : <span onClick={copyClipboard(type)}><i className="fas fa-clipboard-list"></i> {isCopy ? 'copied' : 'copy'}</span>
                                                        </p>
                                                        <code className={classes.code}>{line}</code>
                                                    </>
                                                )
                                            })
                                        }
                                    </pre>
                                </li>
                                <li>
                                    <p><strong>Disable with browser add-ons</strong></p>
                                    <a 
                                        href='https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino?hl=en'
                                        target='_blank' 
                                        rel='noopener noreferrer'
                                    >CORS Unblock <i className="fas fa-external-link-alt"></i></a>
                                </li>
                            </ol>
                        </Alert>
                    ) : null
                }
            </div>
        </div>
    );
}
