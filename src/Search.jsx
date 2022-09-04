import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    useParams,
    useHistory,
} from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import SearchIcon from '@material-ui/icons/Search';
import { Paper } from '@material-ui/core';

import LogDetail from './LogDetail.jsx';
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
    }
}));


export default function Search(props) {
    const {
        slackData,
        searchValue,
        setSearchValue,
    } = props;
    const {
        workSpace,
    } = useParams();
    const classes = useStyles();
    const history = useHistory();
    const users = slackData.setting.users;
    const searchInput = React.useRef(null);
    const searchLog = (_searchValue='') => {
        if(searchValue === '') return [];
        const matchLogs = [];
        const searchText = new RegExp(`${(_searchValue).toLowerCase()}`);
        const ownerIds   = {};
        const threadIds  = [];
        Object.keys(slackData.channels).forEach(channelName => {
            const channelData = slackData.channels[channelName];
            Object.keys(channelData).forEach(period => {
                const periodData = slackData.channels[channelName][period];
                
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
                })
            })
        });
        return matchLogs;
    }
    const submit = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const _searchValue = searchInput.current.value;
        setSearchValue(_searchValue);
        return false;
    }
    const gotoMessage = (channelId, threadId, client_msg_id) => () => {
        history.push(`/${workSpace}/log/${channelId}${threadId ? `/${threadId}` : ''}?client_msg_id=${client_msg_id}`);
    }
    const logs = searchLog(searchValue);
    const isNotFound = Boolean(searchValue && logs.length === 0);
    return (
        <div className={classes.root}>
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
            <div className={classes.listBox}>
                {
                    isNotFound && (<div style={{padding : 8}}>
                        <Typography>
                            No log matching the <strong>{searchValue}</strong> exists...🥲
                        </Typography>
                    </div>)
                }
                {
                    logs.map(log => {
                        const {
                            user : userId,
                            client_msg_id,
                            channelName,
                            channelId,
                            threadId,
                        } = log;
                        const user = users.find(user => user.id === userId);
                        return (
                            <Paper onClick={gotoMessage(channelId, threadId, client_msg_id)} id={client_msg_id} key={client_msg_id} className={classes.List}>
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
                    })
                }
            </div>
        </div>
    );
}
