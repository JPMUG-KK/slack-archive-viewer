import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Divider } from '@material-ui/core';
const useStyles = makeStyles(theme => ({
    root : {
        flex : 1,
        display : 'flex',
    },
    button : {
        color : 'rgba(255,255,255,0.75)',
        flex : 1,
        justifyContent : 'space-between',
        alignItems : 'center',
        gap : 8,
    },
    selectedLabel : {
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width : 82,
        textAlign : 'left',
    },
    MenuPaper : {
        minWidth : 240,
    },
    Divider : {
        margin : '12px 0',
    },
    ListItemIcon : {
        minWidth : 24,
    }
}));
export default function SelectWorkSpsce(props) {
    const classes = useStyles();
    const {
        options=[],
        moveImportPage,
        onChange,
    } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleChange = (name) => () => {
        onChange(name);
        handleClose();
    }
    const selectedLabel = options.find(option => option.selected)?.label || 'unselected'; 
    return (
        <div className={classes.root}>
            <Button className={classes.button} size="small" aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                <div className={classes.selectedLabel}>{selectedLabel}</div>
                <ExpandMoreIcon />
            </Button>
            <Menu
                id="workspace-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                classes={{
                   paper :  classes.MenuPaper
                }}
            >
                {
                    options.map((menu, i) => <MenuItem selected={menu.selected} onClick={handleChange(menu.label)}>{menu.label}</MenuItem>)
                }
                <Divider className={classes.Divider} />
                <MenuItem onClick={moveImportPage}>
                    <ListItemIcon className={classes.ListItemIcon}>
                        <i className="fas fa-file-import" style={{fontSize : 14}}></i>
                    </ListItemIcon>
                    Import
                </MenuItem>
        </Menu>
        </div>
    );
}
