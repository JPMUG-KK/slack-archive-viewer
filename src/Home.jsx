import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Switch,
    Route,
    useHistory,
    Redirect,
} from 'react-router-dom';
import {
    getCurrentWorkSpacesData,
} from './utility.js';
import Import from './Import.jsx';
import App from './App.jsx';
const useStyles = makeStyles(theme => ({
  
}));

export default function Dashboard() {
    const classes = useStyles();
    const history = useHistory();

    const [initComplete, setInitComplete] = React.useState(false);
    const [currentWorkSpaces, setCurrentWorkSpaces] = React.useState({});
    const [slackData, setSlackData] = React.useState(null);
    const [searchValue, setSearchValue] = React.useState('');
    const [isCors, setIsCors] = React.useState(true);
    const changeSlackData = (workSpace, selectedName=null) => {
        const _currentWorkSpaces = {...currentWorkSpaces, ...workSpace};
        const data = _currentWorkSpaces[selectedName];
        
        setSlackData({...data});
        setCurrentWorkSpaces(_currentWorkSpaces);
    }
    const changeWorkSpace = (name) => {
        changeSlackData(currentWorkSpaces, name);
    }
    const changeLocation = (data) => {
        if(!data) return;
        const selectedName = data.workSpace;
        const channels     = data.setting.channels;
        const channelId    = channels.find(channel => channel.name === 'general')?.id || null;

        history.push(`/${encodeURIComponent(selectedName)}/log/${channelId}`);
    }
    const moveImportPage = () => {
        setSlackData(null);
    }
    
    React.useEffect(()=>{
        changeLocation(slackData);
    }, [slackData]);
    
    React.useEffect(()=>{
        (async () => {
            const _currentWorkSpaces = await getCurrentWorkSpacesData();
            const workSpaceNames = Object.keys(_currentWorkSpaces);
            if(workSpaceNames.length){
                changeSlackData(_currentWorkSpaces, workSpaceNames[0]);
            }
            const cors = await fetch('https://line-2f7e0.web.app/img/logo.png')
                .then(res => false)
                .catch(err => true);
            setIsCors(cors);
            setInitComplete(true);
        })()
    }, [])
    return (
        <div className={classes.root}>
        {
            slackData ? (
                <Switch>
                    <Route 
                        path={['/:workSpace/:appType/:channelId/:logId', '/:workSpace/:appType/:channelId', '/:workSpace/:appType']} 
                        render={(props) => (
                            <App 
                                isCors={isCors} 
                                currentWorkSpaces={currentWorkSpaces} 
                                slackData={slackData} 
                                searchValue={searchValue} 
                                setSearchValue={setSearchValue} 
                                moveImportPage={moveImportPage} 
                                changeWorkSpace={changeWorkSpace}
                            />
                        )} 
                    />
                </Switch>
            ) : <Redirect to='/import' />
        }
        <Switch>
            <Route path='/import' render={(props) => (
                    <Import 
                        initComplete={initComplete} 
                        isCors={isCors} 
                        changeSlackData={changeSlackData} 
                    />
                )
            } />
        </Switch>
        </div>
    );
}
