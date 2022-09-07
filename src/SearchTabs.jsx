import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {
    useParams,
    useHistory,
} from 'react-router-dom';
const useStyles = makeStyles(theme => ({
    root : {
        minHeight : 52,
        display : 'flex',
        alignItems : 'flex-end',
        '& .MuiTab-textColorPrimary.Mui-selected' : {
            color : '#007a5a',
        },
        '& .MuiTabs-indicator' : {
            backgroundColor : '#007a5a',
        }
    },
    tabBox : {
        padding : '0 24px',
    }
}))
export default function SearchTabs(props) {
    const {
        workSpace,
        channelId : tabType,
        logId : searchWord = null,
    } = useParams();
    const value = tabType === 'messages' ? 0 : 1;
    const history = useHistory();
    const classes = useStyles();
    const handleChange = (event, newValue) => {
        const tab = newValue === 0 ? 'messages' : 'files'
        const url = `/${workSpace}/search/${tab}${searchWord ? `/${searchWord}` : ''}`;
        history.push(url);
        //onChange(newValue);
    };

    return (
        <Paper className={classes.root} square>
            <div className={classes.tabBox}>
                <Tabs
                    value={value}
                    indicatorColor="primary"
                    onChange={handleChange}
                >
                    <Tab label="Messages" />
                    <Tab label="Files" />
                </Tabs>
            </div>
        </Paper>
    );
}
