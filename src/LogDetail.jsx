import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    useParams,
    Link,
} from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import ListItemText from '@material-ui/core/ListItemText';
import UserAvatar from './UserAvatar.jsx';
import AttachedFile from './AttachedFile.jsx';
import Reactions from './Reactions.jsx';
import ReactMarkdown from 'react-markdown';
import {
    emojiSupport,
} from './utility.js';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
    root : {
        height : '100vh',
        overflowY : 'auto',
        flex : 1,
    },
    logPannelTitle : {
        fontSize : 18,
        padding : '12px 16px',
        borderBottom : 'solid 1px #ddd',
        position : 'sticky',
        top : 0,
        zIndex : 1,
        backgroundColor:'#fff',
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
        wordBreak : 'break-all',
        whiteSpace : 'pre-line',
        '& p' :{
            margin : 0,
        },
        '& a' : {
            color : '#3173ac',
            textDecoration : 'none',
        },
        '& code' : {
            backgroundColor : '#eee',
            border : 'solid 1px #ddd',
            padding : '2px 4px',
            color : '#e01e5a',
            borderRadius : 2,
        },
        '& pre' : {
            '& code' : {
                display : 'block',
                padding : '4px 8px',
                borderRadius : 4,
                color : 'rgba(0,0,0,0.85)',
            },
        }
    },
    attachments : {
        display : 'flex',
        flexWrap : 'wrap',
        alignItems : 'flex-end',
        gap : 8,
    },
    threadLink : {
        display : 'flex',
        alignItems : 'center',
        gap : 4,
        textDecoration : 'none',
        color : '#1164A3',
        paddingTop : 8,
    },
    threadLinkText : {
        fontSize: 13,
        fontWeight : 600,
    },
    logToolBox : {
        position : 'relative',
        //zIndex : 2,
    }
}));


export default function LogDetail(props) {
    const {
        users,
        user,
        log,
        isThread=false,
        dateFormat='LT',
        channelId,
    } = props;

    const {
        workSpace,
        appType,
        logId=null,
    } = useParams();
    const classes = useStyles();
    const Log = (props) => {
        const {
            log,
        } = props;
        const {
            user : id,
            ts,
            text,
            files=[],
            reply_count=0,
            reply_users=[],
            reactions=[],
            //client_msg_id=null,
        } = log;
        const client_msg_id = log?.client_msg_id || `${log.user}:${log.ts}`;
        const date = moment(ts * 1000).format(dateFormat); //moment(ts * 1000).format('YYYY-MM-DD HH:mm');
        const {
            name,
            real_name,
        } = user;
        let message = text;
        users.forEach(u => {
            const userRegExp = new RegExp(`<@${u.id}>`, 'gi');
            message = emojiSupport(message.replace(userRegExp, u.real_name));
        });
        const hasReactions = Boolean(reactions.length);
        
        return (
            <div className={classes.logBox}>
                <div className={classes.logHead}>
                    <Typography className={classes.logUser}>{real_name}</Typography>
                    <Typography className={classes.logDate}>{date}</Typography>
                </div>
                <div className={classes.logText}>
                    <ReactMarkdown children={message} />
                </div>
                <div className={classes.logToolBox}>
                <div className={classes.attachments}>
                {
                    files.map(file => <AttachedFile file={file} />)
                }
                </div>
                {
                    hasReactions && <Reactions users={users} reactions={reactions} />
                }
                {
                    !isThread && (
                        <Link className={classes.threadLink} to={`/${workSpace}/log/${channelId}/${client_msg_id}`}>
                        {
                            reply_users.map(id => {
                                const user = users.find(u => u.id === id);
                                return (
                                    <UserAvatar users={users} id={id} size={24} />
                                )
                                
                            })
                        }
                        {
                            reply_count > 0 && (
                                <Typography className={classes.threadLinkText}>{reply_count} replie{reply_count > 1 ? 's' : null}</Typography>
                            )
                        }
                        </Link>
                    )
                }
                
                </div>
            </div>
        )
    }
    const LogDetailComponent = React.useCallback((props)=>{
        return (
            <>
                <UserAvatar users={users} id={user.id} />
                <ListItemText primary={<Log log={log} />} />
            </>
        )
    }, [log])
    return (
        
        <>
            <LogDetailComponent />
        </>
    );
}
