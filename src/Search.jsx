import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    useParams,
    useHistory,
} from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import SearchIcon from '@material-ui/icons/Search';
import { Paper } from '@material-ui/core';
import SearchTabs from './SearchTabs.jsx';
import LogDetail from './LogDetail.jsx';
import AttachedFile from './AttachedFile.jsx';
import moment from 'moment';
const useStyles = makeStyles(theme => ({
    root : {
        height : '100vh',
        overflowY : 'auto',
        flex : 1,
        backgroundColor : '#eee'
    },
    searchBox : {
        margin : '12px 16px',
        display : 'flex',
        alignItems : 'center',
    },
    input : {
        border : 'none',
        outline : 'none',
        appearance : 'none',
        padding : '8px',
        backgroundColor : 'transparent',
        fontSize : 18,
        flex : 1,
    },
    searchIcon : {
        marginLeft : 8,
    },
    listBox : {
        padding : '12px 16px',
        display : 'flex',
        flexDirection : 'column',
        gap : 12,
    },
    List : {
        padding : '8px 12px',
        cursor : 'pointer'
    },
    listInner : {
        display : 'flex',
        alignItems : 'flex-start',
    },
    channelName : {
        opacity : 0.7,
        fontSize : 14,
    },
    shared : {
        fontSize : 14,
        '& strong' : {
            opacity : 0.85,
        },
        '& span' : {
            opacity : 0.7,
            fontSize : 13,
        },
    }
}));


export default function Search(props) {
    const {
        slackData,
        //searchValue,
        //setSearchValue,
    } = props;
    const {
        workSpace,
        channelId,
        logId : searchValue = '',
    } = useParams();
    const classes = useStyles();
    const history = useHistory();
    const users = slackData.setting.users;
    //console.log({channelId});
    const selectTab = channelId === 'messages' ? 0 : 1;
    const searchInput = React.useRef(null);
    const searchLog = () => {
        if(searchValue === '') return [[], []];
        const matchLogs = [];
        const matchFiles= [];
        const searchText = new RegExp(`${(searchValue).toLowerCase()}`);
        const ownerIds   = {};
        const threadIds  = [];
        const ignoreSubTypes = ['bot_message'];
        Object.keys(slackData.channels).forEach(channelName => {
            const channelData = slackData.channels[channelName];
            Object.keys(channelData).forEach(period => {
                const periodData = slackData.channels[channelName][period].filter(log => !ignoreSubTypes.includes(log.subtype));
                
                periodData
                    .filter(log => log.replies)
                    .forEach(log => log.replies.map(replie => {
                        const id      = `${replie.user}:${replie.ts}`;
                        const ownerId = log?.client_msg_id || `${log.user}:${log.ts}`;
                        ownerIds[id]  = ownerId;
                        threadIds.push(id);
                    }));
                periodData.forEach(log => {
                    const logText = (log.text || '').toLowerCase();
                    const threadId = `${log.user}:${log.ts}`;
                    const isThread = threadIds.includes(threadId);

                    if(logText.search(searchText) > -1){
                        const channelId = slackData.setting.channels.find(channel => channel.name === channelName).id;
                        matchLogs.push({
                            ...log,
                            channelName,
                            channelId,
                            threadId : isThread ? ownerIds[threadId] : null,
                        });
                    }

                    const files    = log?.files || [];
                    files.forEach(file => {
                        const fileName = (file.name || '').toLowerCase();
                        if(fileName.search(searchText) > -1){
                            const channelId = slackData.setting.channels.find(channel => channel.name === channelName).id;
                            matchFiles.push({
                                ...log,
                                file : {...file},
                                channelName,
                                channelId,
                                threadId : isThread ? ownerIds[threadId] : null,
                            });
                        }
                    })
                })
            })
        });
        return [matchLogs, matchFiles];
    }
    const submit = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const _searchValue = searchInput.current.value;
        const url = `/${workSpace}/search/${channelId}${_searchValue ? `/${_searchValue}` : ''}`;
        history.push(url);
        /*
        
        setSearchValue(_searchValue);
        */
        return false;
    }
    const gotoMessage = (channelId, threadId, client_msg_id) => () => {
        history.push(`/${workSpace}/log/${channelId}${threadId ? `/${threadId}` : ''}?client_msg_id=${client_msg_id}`);
    }
    const logs = searchLog(searchValue);
    //console.log({logs});
    const displayResults = logs[selectTab];
    const isNotFound = Boolean(searchValue && displayResults.length === 0);
    return (
        <div className={classes.root}>
            <SearchTabs />
            <Paper elevation={1} className={classes.searchBox} component='form' onSubmit={submit}>
                <SearchIcon className={classes.searchIcon} />
                <input 
                    ref={searchInput} 
                    className={classes.input} 
                    type="text" 
                    placeholder='Search Logs' 
                    defaultValue={searchValue}
                />
            </Paper>
            <div className={classes.listBox} style={{
                flexDirection : selectTab ? 'row' : null,
                flexWrap : selectTab ? 'wrap' : null,
            }}>
                {
                    isNotFound && (<div style={{padding : 8}}>
                        <Typography>
                            No log matching the <strong>{searchValue}</strong> exists...🥲
                        </Typography>
                    </div>)
                }
                {
                    displayResults.map((log, i) => {
                        const {
                            user : userId,
                            client_msg_id,
                            channelName,
                            channelId,
                            threadId,
                            file,
                        } = log;
                        
                        if(selectTab === 0){
                            const user = users.find(user => user.id === userId);
                            return (
                                <Paper 
                                    key={`log-${channelId}-${threadId}-${client_msg_id}-${i}`} 
                                    onClick={gotoMessage(channelId, threadId, client_msg_id)} 
                                    id={client_msg_id} 
                                    className={classes.List}
                                >
                                    <Typography className={classes.channelName}># {channelName}</Typography>
                                    <div className={classes.listInner}>
                                        <LogDetail 
                                            users={users}
                                            user={user}
                                            log={log}
                                            channelId={channelId}
                                        />
                                    </div>
                                </Paper>
                            )
                        }
                        const {
                            id,
                            name,
                            user : shareUserId,
                            created,
                            username,
                        } = file;
                        const fileId = id || `${log.user}:${log.ts}`;
                        const user = users.find(user => user.id === shareUserId);
                        user === undefined && console.log({file});
                        const userName = user?.real_name || user?.name || username;
                        return (
                            <Paper
                                key={`image-${channelId}-${threadId}-${fileId}-${i}`} 
                                onClick={gotoMessage(channelId, threadId, fileId)} 
                                id={fileId} 
                                className={classes.List}
                            >
                                <Typography className={classes.shared}>
                                    <strong>{name}</strong><br />
                                    <span>Shared by {userName} on {moment(created * 1000).format('MMM Do YYYY')}</span>
                                </Typography>
                                <AttachedFile file={file} />
                            </Paper>
                        )
                    })
                }
            </div>
        </div>
    );
}
