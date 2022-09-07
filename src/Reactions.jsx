import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    emojiSupport,
} from './utility.js';
import { Tooltip } from '@material-ui/core';
const useStyles = makeStyles(theme => ({
    reactionBox : {
        display : 'flex',
        alignItems : 'center',
        justifyContent : 'flex-start',
        gap : 8,
        paddingTop : 8,
    },
    undefinedIcon : {
        color : '#2c3e50',
    },
    reactionLabel : {
        backgroundColor : '#eee',
        padding : '2px 8px',
        borderRadius : 16,
        display : 'flex',
        alignItems : 'center',
        gap : 8,
    },
    reactionCount : {
        fontSize : 11,
    },
    bigIcon : {
        width : 48,
        height : 48,
        display : 'flex',
        justifyContent : 'center',
        alignItems : 'center',
        fontSize : 40,
        backgroundColor : '#fff',
        borderRadius : 2,
        margin : '8px auto',
    },
    description : {
        fontSize : 13,
        '& span' : {
            opacity : 0.65,
        }

    }
}));


export default function Reactions(props) {
    const classes = useStyles();
    const {
        users=[],
        reactions=[],
    } = props;
    const undefinedIcon = <i className={`far fa-question-circle ${classes.undefinedIcon}`}></i>;
    return (
        <div className={classes.reactionBox}>
            {
                reactions.map(reaction => {
                    const {
                        name,
                        count,
                        users : reactionUsers,
                    } = reaction;
                    const emojiText = `:${name}:`;
                    const emojiData = emojiSupport(emojiText);
                    const emojiIcon = emojiData === 'undefined' ? undefinedIcon : emojiData;
                    const usersText = reactionUsers
                        .map(id => {
                            const user = users.find(u => u.id === id);
                            return user?.real_name || user?.name || null;
                        })
                        .join(', ');

                    return (
                        <Tooltip title={<div>
                            <div className={classes.bigIcon}>{emojiIcon}</div>
                            <span className={classes.description}>{usersText}
                            <span>{` reacted with ${emojiText}`}</span>
                            </span>
                        </div>} arrow>
                            <div className={classes.reactionLabel}>
                                <span>{emojiIcon}</span>
                                <span className={classes.reactionCount}>{count}</span>
                            </div>
                        </Tooltip>
                    )
                })
            }
        </div>
    )
}
