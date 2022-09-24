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
import { faCommentsDollar } from '@fortawesome/free-solid-svg-icons';
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
            '& p' : {
                margin : '-18px 0',
            }
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
    const styleTypes = {
        bold  : (text) => {
            return `**${text}**`;
        },
        italic : (text) => {
            return `_${text}_`;
        },
        strike : (text) => {
            return `~~${text}~~`;
        },
        code : (text) => {
            return `\`${text}\``;
        },
        rich_text_quote: (text) => {
            const lines = text.split('\n');
            return `${lines.map(line => `> ${line}`).join('\n')}`;
        },
        rich_text_preformatted : (text) => {
            return `\`\`\`
${text}
\`\`\`\n`;
        },
        link : (text, url) => {
            return `[${text}](${url})`
        },
        user : (id) => {
            const user  = users.find(u => u.id === id) || {};
            const {
                real_name=null,
                name='unknown',
            } = user;
            return `**@${real_name || name}**`;
        },
        broadcast : (text) => {
            return `**@${text}**`;
        },
        emoji : (text) => {
            return emojiSupport(`:${text}:`);
        },
        unlink : (text) => {
            return text;
        },
        mrkdwn : (text) => {
            // Exclude time from being judged as a emoji
            if(text.match(/[0-2][0-9]:[0-5][0-9]:[0-5][0-9]/)){
                return text;
            }
            const mrkdwnText = replaceMessage(text);
            return mrkdwnText;
        },
        rich_text_list : {
            bullet : (text) => {
                return `* ${text}`;
            },
            ordered : (text) => {
                return `1. ${text}`;
            }
        }
    }
    const parseElements = (elements, richTextListParams=null) => {
        return elements.flatMap((element, index) => {
            const {
                text,
                name=null,
                user_id=null,
                range=null,
                type=null,
                style=null,
                url=null,
                unicode=null,
                listType=null,
                listStyle=null,
            } = element;
            let {
                elements : childElemens=null,
            } = element;
            const isFirst = index === 0;
            const endNewLine = index === elements.length - 1 ? '\n\n' : '';
            if(childElemens){
                if(type === 'rich_text_list'){
                    childElemens = childElemens.map(child => {
                        return {
                            ...child,
                            elements : child.elements.map(childElement => {
                                return {
                                    ...childElement,
                                    listType  : type,
                                    listStyle : style,
                                }
                            })
                        }
                    });
                }
                if(['rich_text_quote', 'rich_text_preformatted'].includes(type)){
                    childElemens = childElemens.map(child => {
                        return {
                            ...child,
                            type : type,
                        }
                    });
                }
                return parseElements(childElemens, richTextListParams);
            }
            let styleText = range || name || user_id || text || url;
            //console.log(index, style, styleText);
            if(style){
                Object.keys(style).forEach(type => {
                    if(styleTypes[type]){
                        styleText = styleTypes[type](styleText);
                    }else{
                        console.log(type, element)
                    }
                })
            }

            if(styleTypes[type]){
                styleText = styleTypes[type](styleText, url);
            }

            if(isFirst && listType && listStyle){
                styleText = styleTypes[listType][listStyle](styleText);
            }
            return `${styleText}${endNewLine}`;
        })
    }
    const parseBlocks = (blocks) => {
        return blocks.flatMap(block => {
            let {
                elements=null,
            } = block;
            const {
                text=null,
                fields=null,
            } = block;
            if(!elements){
                if(text){
                    elements = [text];
                }
                if(fields){
                    elements = [...fields];
                }
            }
            if(!elements){
                console.error(`Undefined parameter in Viewer 🙇🏻‍♂️`, blocks);
                return '';
            }
            return parseElements(elements);
        })
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
            blocks=[],
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
        //let message = replaceMessage(text || customText);
        //console.log(message)
        const mentionText  = ['@here', '@channel'].concat(users.map(u => `@${u.real_name || u.name}`));
        const hasReactions = Boolean(reactions.length);
        const isMention = (props) => {
            return Boolean(props.children.filter(child => mentionText.includes(child)).length)
        }
        const message = (blocks.length) ? parseBlocks(blocks).join(' ') : replaceMessage(text || customText);
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
