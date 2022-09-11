import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    useParams,
    useLocation,
} from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import LogDetail from './LogDetail.jsx';

const useStyles = makeStyles(theme => ({
    root : {
        //maxWidth : 'calc(100vw - 240px)',
        flex : 1,
        overflow : 'hidden',
    },
    logPannelTitle : {
        width : 'calc(100vw - 240px)',
        fontSize : 18,
        padding : '12px 16px',
        borderBottom : 'solid 1px #ddd',
        backgroundColor:'#fff',
    },
    list : {
        height : 'calc(100vh - (60px + 28px))',
        overflowX : 'hidden',
        overflowY : 'auto',
        paddingTop : 28,
    },
    List : {
        alignItems : 'flex-start',
        //contentVisibility: 'auto',
        //containIntrinsicSize: 80,
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
        marginTop : 8,
        '& hr' : {
            flex : 1,
        },
    },
    dateDividerLabelBox : {
        position : 'sticky',
        top : -20,
        display : 'flex',
        justifyContent : 'center',
        zIndex : 1,
        marginBottom : 24,
    },
    dateDividerLabel : {
        border : 'solid 1px rgba(0,0,0,0.12)',
        fontSize : 13,
        fontWeight : 500,
        padding : '6px 12px',
        borderRadius : 18,
        backgroundColor : '#fff',
        position : 'absolute',

    }
}));


export default function Log(props) {
    const {
        slackData,
    } = props;
    const {
        channelId=null,
        logId=null,
    } = useParams();
    const location = useLocation();
    const classes = useStyles();
    const [logData, setLogData] = React.useState([]);
    const users = slackData.setting.users;
    const activeChannel = slackData.setting.channels.find(channel => channel.id === channelId);
    const activeChannelName = activeChannel?.name || null;


    const scrollLog = (log_id) => {
        const logElem = document.getElementById(`${log_id}`);
        if(logElem){
            setTimeout(()=>{
                logElem.scrollIntoView({behavior: "smooth"});
            }, 1000);
            //document.querySelector('#contant').scrollTop = logElem.offsetTop;
            return;
        }
        setTimeout(()=>{
            scrollLog(log_id);
        }, 750)
    }
    const DateDivider = (props) => {
        const {
            date,
        } = props;
        return (
            <React.Fragment key={`log-date-title-${channelId}-${date}`}>
                <div className={classes.dateDivider}>
                    <Divider/>
                </div>
                <div className={classes.dateDividerLabelBox}>
                    <Typography className={classes.dateDividerLabel}>{date}</Typography>
                </div>
            </React.Fragment>
        )
    }
    React.useEffect(()=>{
        setLogData(slackData.channels[activeChannelName]);
    }, [channelId])
    React.useEffect(()=>{
        const params  = new URLSearchParams(location.search);
        const log_id = params.get('client_msg_id');
        if(log_id){
            scrollLog(log_id);
        }
    }, [location.search]);
    const threadIds = [];
    return (
        activeChannelName && (
            <div className={classes.root} key={`log-${channelId}`}>
                <Typography className={classes.logPannelTitle}># {activeChannelName}</Typography>
                <List id="contant" className={classes.list} dense={true} component="nav">
                    {
                        Object.keys(logData)
                            .sort((a, b) => a > b ? 1 : -1)
                            .map(date => {
                                logData[date].forEach(log => {
                                    const replies = log?.replies || [];
                                    replies.forEach(replie => threadIds.push(`${replie.user}:${replie.ts}`));
                                })

                                const logs = logData[date]
                                    .filter(log => log.subtype || !threadIds.includes(`${log.user}:${log.ts}`))
                                    //.filter(log => !threadIds.includes(`${log.user}:${log.ts}`))
                                    .filter(log => log.text)
                                    .sort((a, b) => a.ts - b.ts);
                                const hasLog = Boolean(logs.length);
                                return (
                                    <React.Fragment key={`log-date-box-${channelId}-${date}`}>
                                        {hasLog && <DateDivider date={date} />}
                                        {
                                            logs
                                                .map(log => {
                                                    const {
                                                        user : userId,
                                                        client_msg_id,
                                                    } = log;
                                                    const user = users.find(user => user.id === userId);
                                                    return (
                                                        //user && (<ListItem id={client_msg_id} key={client_msg_id} className={classes.List}>
                                                        (<ListItem id={client_msg_id} key={client_msg_id} className={classes.List}>
                                                            <LogDetail 
                                                                users={users}
                                                                user={user}
                                                                log={log}
                                                                channelId={channelId}
                                                            />
                                                        </ListItem>)
                                                    )
                                                })
                                        }
                                    </React.Fragment>
                                )

                            })

                    }
                </List>
            </div>
        )


    );
}
