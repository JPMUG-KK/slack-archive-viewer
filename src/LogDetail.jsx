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
import remarkGfm from 'remark-gfm';
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
        '& *' :{
            fontSize : 14,
        },
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
            fontSize : 12,
        },
        '& pre' : {
            '& code' : {
                display : 'block',
                padding : '4px 8px',
                borderRadius : 4,
                color : 'rgba(0,0,0,0.85)',
                overflowX : 'auto',
            },
        },
        '& ul,& ol' : {
            whiteSpace : 'normal',
            margin : 0,
            padding : '0 0 0 16px',
        },
        '& blockquote' : {
            borderLeft: 'solid 3px #ddd',
            margin: 0,
            padding: '0 0 0 18px',
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
    },
    mentionLink : {
        textDecoration : 'none',
        fontStyle : 'normal',
        backgroundColor : '#f2c74466',
        fontWeight : 600,
        padding : '1px 2px',
        borderRadius : 2,
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
    const replaceMessage = (text) => {
        const mentionRegExp = new RegExp(/^<!|>$/gi);
        const mentionText  = ['@here', '@channel'];
        const msgRegExp = [{
            // bold
            key   : '\\*(.+)?\\*',
            replacer : (value, text) => {
                return `**${text}**`;
            },
        },{
            key   : '<!here>',
            replacer : (value) => `**@${value.replace(mentionRegExp, '')}**`,
        }, {
            key : '<!channel>',
            replacer : (value) => `**@${value.replace(mentionRegExp, '')}**`,
        }, {
            key : '<!subteam.+?\\|@.+?>',
            replacer : (value) => {
                const channelName = (value.split('|')?.[1] || 'undefined').replace(/>$/, '');
                if(!mentionText.includes(channelName)){
                    mentionText.push(channelName);
                }
                return `**${channelName}**`;
            } ,
        },{
            // strikethrough
            key   : '\\~(.+)?\\~',
            replacer : (value, text) => {
                return `~~${text}~~`;
            },
        },{
            // link
            key   : '\\<(.*)?\\|(.*)?\\>',
            replacer : (value, href, text) => {
                return `[${text}](${href})`;
            },
        },{
            // list
            key   : '•\\s(.*)?\\n',
            replacer : (value, text) => {
                return `* ${text}\n`;
            },
        },{
            // code block
            key   : '`{3}',
            replacer : '\n```',
        },{
            // Remove ampersand escaping of entity
            key   : '\\&gt;',
            replacer : '>',
        },{
            // Remove ampersand escaping of entity
            key : '\\&lt;',
            replacer : '<', 
        }];
        text = emojiSupport(text);
        users.forEach(u => {
            const userRegExp = new RegExp(`<@${u.id}>`, 'gi');
            const name = u.real_name || u.name;
            if(!mentionText.includes(`@${name}`)){
                mentionText.push(`@${name}`);
            }
            text = (text || '').replace(userRegExp, `**@${name}**`);
        });

        msgRegExp.forEach(params => {
            const {
                key,
                replacer,
            } = params;
            const regExp = new RegExp(key, 'gi');
            text = (text || '').replace(regExp, replacer);
        });
        

        
        return text;
    }
    const Log = (props) => {
        const {
            log,
        } = props;
        const {
            user : id,
            ts,
            text,
            customText,
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
        } = user || {
            // 'USLACKBOT' = slack bot
            name : 'Slackbot',
        };
        const userName = real_name || name;
        let message = replaceMessage(text || customText);
        console.log(message)
        const mentionText  = ['@here', '@channel'].concat(users.map(u => `@${u.real_name || u.name}`));
        const hasReactions = Boolean(reactions.length);
        const isMention = (props) => {
            return Boolean(props.children.filter(child => mentionText.includes(child)).length)
        }
        return (
            <div className={classes.logBox}>
                <div className={classes.logHead}>
                    <Typography className={classes.logUser}>{userName}</Typography>
                    <Typography className={classes.logDate}>{date}</Typography>
                </div>
                <div className={classes.logText}>
                    <ReactMarkdown 
                        remarkPlugins={[[remarkGfm, {singleTilde: false}]]}
                        children={message} 
                        
                        components={{
                            'strong' : ({node, ...props}) => {
                                const isLinkText = isMention(props);
                                const className = isLinkText ? classes.mentionLink : null;
                                return <strong className={className} {...props} />
                            }/*,
                            'em' : ({node, ...props}) => {
                                const isLinkText = isMention(props);
                                return isLinkText ? <strong className={classes.mentionLink} {...props} /> : <strong {...props} />
                            }
                            */
                        }}
                        
                    />
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
                <UserAvatar users={users} id={user?.id || null} />
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
