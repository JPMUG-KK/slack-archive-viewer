import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    useParams,
} from 'react-router-dom';
import Menu from './Menu.jsx';
import Log from './Log.jsx';
import Thread from './Thread.jsx';
import Search from './Search.jsx';
const useStyles = makeStyles(theme => ({
    root : {
        display : 'flex',
    },
    menuResizeBar : {
        position : 'fixed',
        top : 0,
        bottom : 0,
        width : 6,
        backgroundColor : '#3498db',
        opacity : 0,
        zIndex : 2,
        transition : 'opacity .2s linear',
        cursor : 'col-resize',
        '&:hover' : {
            opacity : 1,
        }
    }
}));


export default function App(props) {
    const {
        slackData,
        currentWorkSpaces,
        searchValue,
        setSearchValue,
        moveImportPage,
        changeWorkSpace,
    } = props;
    const [menuWidth, setMenuWidth] = React.useState(Number(window.localStorage.getItem('menuWidth') || 240));
    const [threadWidth, setThreadWidth] = React.useState(Number(window.localStorage.getItem('threadWidth') || Math.ceil(window.innerWidth / 3)));
    const [dragFlag, setDragFlag] = React.useState(false);
    const [direction, setDirection] = React.useState(null);
    const menuId = 'menu-box';
    const menuResizeBarId = 'menu-resize-bar';
    const threadId = 'thread-box';
    const threadResizeBarId = 'thread-resize-bar';
    const {
        appType,
        channelId=null,
        logId=null,
    } = useParams();
    const classes = useStyles({
        menuWidth,
        selectable : dragFlag.current,
    });
    
    const toggleDragFlag = (dir, flag) => (event) => {
        dir && setDirection(dir);
        setDragFlag(flag);
        if(!flag){
            const {
                clientX,
            } = event;
            if(direction === 'menu'){
                setMenuWidth(clientX);
                window.localStorage.setItem('menuWidth', clientX);
            }
            if(direction === 'thread'){
                const threadSize = window.innerWidth - clientX;
                setThreadWidth(threadSize);
                window.localStorage.setItem('threadWidth', threadSize);
            }
            setDirection(null);
        }
    }
    const capturePosition = (event) => {
        if(dragFlag){
            const box       = document.querySelector(direction === 'menu' ? `#${menuId}` : `#${threadId}`);
            const resizeBar = document.querySelector(direction === 'menu' ? `#${menuResizeBarId}` : `#${threadResizeBarId}`);
            const posType   = direction === 'menu' ? 'left' : 'right';

            if(box && resizeBar){
                const posX = direction === 'menu' ? `${event.clientX}px` : `calc(100vw - ${event.clientX}px)`;

                box.style.minWidth   = posX;
                box.style.maxWidth   = posX;
                resizeBar.style[posType] = `calc(${posX} - 3px)`;
            }


        }
    }
    return (
        <div 
            className={classes.root} 
            onMouseMove={capturePosition} 
            onMouseUp={toggleDragFlag(null, false)}
            style={{
                userSelect : dragFlag ? 'none' : null,
            }}
        >
            <Menu 
                currentWorkSpaces={currentWorkSpaces} 
                slackData={slackData} 
                searchValue={searchValue} 
                moveImportPage={moveImportPage}
                changeWorkSpace={changeWorkSpace}
                menuWidth={menuWidth}
                menuId={menuId}
            />
            {
                logId && (
                    <div 
                        id={threadResizeBarId}
                        className={classes.menuResizeBar} 
                        onMouseDown={toggleDragFlag('thread', true)}
                        style={{
                            right : threadWidth - 3,
                        }}
                    ></div>
                )
            }

            <div 
                id={menuResizeBarId}
                className={classes.menuResizeBar} 
                onMouseDown={toggleDragFlag('menu', true)}
                style={{
                    left : menuWidth - 3,
                }}
            ></div>
            {
                appType === 'log' ? (
                    <>
                        <Log slackData={slackData} />
                        {
                            logId && (<Thread threadId={threadId} threadWidth={threadWidth} slackData={slackData}/>)
                        }
                    </>
                ) : (
                    <Search slackData={slackData} searchValue={searchValue} setSearchValue={setSearchValue} />
                )
            }

        </div>
    );
}
