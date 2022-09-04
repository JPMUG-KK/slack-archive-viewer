import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    useParams,
    useHistory,
} from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import LogDetail from './LogDetail.jsx';

import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(theme => ({
    root : (props) => ({
        height : '100vh',
        maxWidth : props.threadWidth,
        minWidth : props.threadWidth,
        overflowX : 'hidden',
        overflowY : 'auto',
        flex : 1,
        scrollMarginTop : '56px',
        borderLeft : 'solid 1px #ddd',
    }),
    logPannelTitle : {
        fontSize : 18,
        padding : '8px 16px 7px 16px',
        borderBottom : 'solid 1px #ddd',
        display : 'flex',
        justifyContent : 'space-between',
        alignItems : 'center',
        zIndex : 1,
        backgroundColor:'#fff',
        borderLeft : 'solid 1px #ddd',
        marginLeft : -1,
        '& small' : {
            opacity : 0.5,
        }
    },
    logPannelTitleLabel : {
        display : 'flex',
        gap : 12,
        alignItems : 'center',
    },
    list : {
        height : 'calc(100vh - (52px + 16px))',
        overflowX : 'hidden',
        overflowY : 'auto',
    },
    List : {
        alignItems : 'flex-start',
    },
    logBox : {
        display : 'flex',
        flexDirection : 'column',
    },
    logHead : {
        display : 'flex',
        alignItems : 'flex-end',
    },
    logUser : {
        fontWeight : 600,
        fontSize : 14,
        paddingRight : 8,
    },
    logDate : {
        fontSize : 12,
        opacity : 0.65,
    },
    logText : {
        fontSize : 14,
        padding : '4px 0',
    },
    attachmentImage : {
        maxHeight : 240,
        borderRadius : 4,
    },
    fileBox : {
        display : 'flex',
        alignItems : 'center',
        textDecoration : 'none',
        color : '#34495e',
        border : 'solid 1px #ddd',
        borderRadius : 4,
        //minHeight : 48,
        padding : 8,
        paddingRight : 12,
        //width : 360,
    },
    attachments : {
        display : 'flex',
        flexWrap : 'wrap',
        gap : 8,
    },
    dateDivider : {
        display : 'flex',
        alignItems : 'center',
        marginBottom : -18,
        '& hr' : {
            flex : 1,
        },
    },
    dateDividerLabelBox : {
        position : 'sticky',
        top : 58,
        display : 'flex',
        justifyContent : 'center',
        zIndex : 1,
    },
    dateDividerLabel : {
        border : 'solid 1px rgba(0,0,0,0.12)',
        fontSize : 13,
        fontWeight : 500,
        padding : '6px 12px',
        borderRadius : 18,
        backgroundColor : '#fff',

    },
    replieBox : {
        display : 'flex',
        alignItems : 'center',
        gap : 8,
        textDecoration : 'none',
        padding : '0 12px',
        '& hr' : {
            flex : 1,
        }
    },
    replieLabel : {
        opacity : 0.5,
        fontSize : 13,
    },
    closeButton : {
        minWidth : 48,
    }
}));


export default function Thread(props) {
    const {
        slackData,
        threadWidth,
        threadId
    } = props;
    const {
        workSpace,
        appType,
        channelId=null,
        logId=null,
    } = useParams();
    const classes = useStyles({threadWidth});
    const history = useHistory();
    const users = slackData.setting.users;
    const activeChannel = slackData.setting.channels.find(channel => channel.id === channelId);
    const activeChannelName = activeChannel?.name || null;
    const logData = slackData.channels[activeChannelName];
    const dateFormat='YYYY-MM-DD LT'

    let flatLogs  = [];
    let parentLog = null;
    let replies   = [];
    const isCompositeId = Boolean(logId.search(/\:/) > -1);
    Object.keys(logData || {}).forEach(date => {
        const log = logData[date].find(log => isCompositeId ? `${log.user}:${log.ts}` === logId : log.client_msg_id === logId) || null
        if(log){
            replies   = log?.replies || [];
            parentLog = log;
        }
        flatLogs = flatLogs.concat(logData[date]);
    });
    const threadLogs = flatLogs.filter(log => {
        const {
            ts,
            user,
        } = log;
        return Boolean(replies.find(replie => replie.ts === ts && replie.user === user));
    });

    const {
        client_msg_id : parent_client_msg_id,
        user : parent_userId,
    } = parentLog || {};
    const parent_log_id = `thread-${parent_client_msg_id}`;
    const parent_user   = users.find(user => user.id === parent_userId);

    const scrollLog = () => {
        const logElem = document.getElementById(`${logId}`);
        if(logElem){
            document.querySelector(`#${threadId}`).scrollTop = logElem.offsetTop;
            return;
        }
        setTimeout(()=>{
            scrollLog();
        }, 750)
    }
    const closeThread = () => {
        history.push(`/${workSpace}/${appType}/${channelId}`);
    }

    React.useEffect(()=>{
        if(logId){
            scrollLog();
        }
    }, [logId])
    return (
        activeChannelName && (
            <div id={threadId} className={classes.root} key={`thread-${logId}`}>
                <Typography className={classes.logPannelTitle} component='div'>
                    <div className={classes.logPannelTitleLabel}>
                        Thread 
                        <small># {activeChannelName}</small>
                    </div>
                    <Button className={classes.closeButton} onClick={closeThread}><CloseIcon /></Button>
                </Typography>
                <List className={classes.list} dense={true} component="nav">
                    <ListItem id={parent_log_id} key={parent_log_id} className={classes.List}>
                        <LogDetail 
                            users={users}
                            user={parent_user}
                            log={parentLog}
                            isThread={true}
                            dateFormat={dateFormat}
                        />
                    </ListItem>
                    <div className={classes.replieBox}>
                        <Typography className={classes.replieLabel}>{threadLogs.length} replie{threadLogs.length > 1 ? 's' : null}</Typography> 
                        <Divider />
                    </div>
                    {
                        threadLogs
                            .sort((a, b) => a.ts - b.ts)
                            .map(log => {
                                const {
                                    user : userId,
                                    client_msg_id,
                                } = log;
                                const user = users.find(user => user.id === userId);
                                return (
                                    user && (<ListItem id={client_msg_id} key={client_msg_id} className={classes.List}>
                                        <LogDetail 
                                            users={users}
                                            user={user}
                                            log={log}
                                            dateFormat={dateFormat}
                                        />
                                    </ListItem>)
                                )
                            })
                    }
                </List>
            </div>
        )

    );
}
