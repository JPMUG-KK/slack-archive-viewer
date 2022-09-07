import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    useParams,
    useHistory,
} from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
    importDb,
} from './utility.js';
import { Tooltip } from '@material-ui/core';
import SelectWorkSpsce from './SelectWorkSpace.jsx';
const useStyles = makeStyles(theme => ({
    root : (props) => ({
        backgroundColor : '#3f0f40',
        minWidth : props.menuWidth,
        maxWidth : props.menuWidth,
        overflow : 'hidden',
    }),
    name : {
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    list : {
        height : 'calc(100vh - (73px))',
        overflowY : 'auto',
        '&::-webkit-scrollbar-thumb' : {
            background: 'rgba(255,255,255,0.25)',
        }
    },
    listTitle : {
        padding : '8px 12px',
        color : 'rgba(255, 255, 255, 0.75)',
        display : 'flex',
        justifyContent : 'space-between',
        alignItems : 'center',
        borderBottom : 'solid 1px rgba(255,255,255,0.15)',
        gap : 8,
        minHeight : 35,
    },
    ListItemRoot : {
        color : 'rgba(255, 255, 255, 0.75)',
    },
    ListItemText : {
        '& .MuiListItemText-primary' : {
            whiteSpace : 'nowrap',
            overflow : 'hidden',
            textOverflow : 'ellipsis',
        }
    },
    ListItemSelected : {
        backgroundColor : '#1263a3 !important',
        color : 'rgba(255, 255, 255, 0.95)'
    },
    searchLabel : {
        display : 'flex',
        alignItems : 'center',
    },
    searchIcon : {
        fontSize : 14,
        marginRight : 8,
    },
    importDbButton : {
        backgroundColor : 'rgba(255, 255, 255, 0.75)',
        padding : 8,
        '&:hover' : {
            backgroundColor : 'rgba(255, 255, 255, 1)',
        }
    },
    iconCoverBox : {
        width: 16,
        height: 16,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize : 16,
        color : '#3f0f40',
    },
    tooltip : {
        fontSize : 13,
    },
    CircularProgress : {
        color : 'rgba(255, 255, 255, 0.75)',
    }
}));


export default function Menu(props) {
    const {
        slackData,
        currentWorkSpaces,
        searchValue,
        moveImportPage,
        changeWorkSpace,
        menuWidth=240,
        menuId,
    } = props;
    const {
        workSpace,
        appType,
        channelId=null,
    } = useParams();
    const [disabledImportButton, setDisabledImportButton] = React.useState(false);
    const classes = useStyles({menuWidth});
    const history = useHistory();

    const changeChannel = (app, id) => () => {
        let url = `/${workSpace}/${app}/${id}`;
        if(app === 'search'){
            url = `/${workSpace}/${app}/messages/${id}`
        }
        history.push(url);
    }

    const channels = slackData.setting.channels.map(c => {
        return {
            ...c,
            selected : c.id === channelId,   
        }
    });
    const workSpaceOptions = Object.keys(currentWorkSpaces).map(name => {
        return {
            label    : name,
            value    : name,
            selected : name === slackData.workSpace,
        }
    });
    const callbackInportDb = (results) => {
        const successLength = results.filter(result => result.successfulToSave).length;
        const errorLength   = results.length - successLength;
        let resultText = `${(successLength).toLocaleString()} data imports were successfully completed 😉`;
        if(errorLength){
            resultText += `
            & There are ${(errorLength).toLocaleString()} files that failed to import...(Perhaps the data was deleted from the slack server)🥲`;
        }
        alert(resultText);
        setDisabledImportButton(false);
    }
    const callImportDb = () => {
        setDisabledImportButton(true);
        importDb(slackData, callbackInportDb);
    }
    return (
        <div id={menuId} className={classes.root}>
            <Typography className={classes.listTitle} component='div'>
                <Tooltip 
                    title={slackData.workSpace}
                    classes={{
                        tooltip : classes.tooltip,
                    }}
                    arrow
                >
                    <SelectWorkSpsce 
                        options={workSpaceOptions} 
                        moveImportPage={moveImportPage}
                        onChange={changeWorkSpace}
                    />
                    {/*<div className={classes.name}>{slackData.workSpace}</div>*/}
                </Tooltip>
                <Tooltip 
                    title='Import images and files into the database' 
                    classes={{
                        tooltip : classes.tooltip,
                    }}
                    arrow
                >
                        <IconButton disabled={disabledImportButton} className={classes.importDbButton} onClick={callImportDb}>
                                {
                                    disabledImportButton ? <CircularProgress size={16} className={classes.CircularProgress} /> : (
                                        <div className={classes.iconCoverBox}>
                                            <i className="fas fa-database"></i>
                                        </div>
                                    )
                                }
                            
                        </IconButton>

                </Tooltip>
            </Typography>
            <List className={classes.list} dense={true} component="nav" aria-label="main mailbox folders">
                {
                    channels.map(channel => {
                        const {
                            id,
                            name,
                            selected,
                        } = channel;
                        return (
                            <ListItem key={id} classes={{
                                selected : classes.ListItemSelected,
                                root : classes.ListItemRoot,
                            }} selected={selected} onClick={changeChannel('log', id)} button>
                                <ListItemText className={classes.ListItemText} primary={`# ${name}`} />
                            </ListItem>
                        )
                    })
                }
                <ListItem style={{
                    position : 'sticky',
                    bottom : -7,
                    zIndex : 1,
                    backgroundColor : '#3f0f40',
                    borderTop : 'solid 1px rgba(255,255,255,0.1)'
                }} classes={{
                    selected : classes.ListItemSelected,
                    root : classes.ListItemRoot,
                }} selected={appType === 'search'} onClick={changeChannel('search', searchValue)} button>
                    <ListItemText primary={<div className={classes.searchLabel}>
                        <SearchIcon className={classes.searchIcon} /> Search
                    </div>} />
                </ListItem>
            </List>
        </div>
    );
}
