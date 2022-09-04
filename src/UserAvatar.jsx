import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import {
    getBase64Data,
} from './utility.js';
const useStyles = makeStyles(theme => ({

}));

export default function UserAvatar(props) {
    const classes = useStyles();
    const [image, setImage] = React.useState(null);
    const {
        users=[],
        id,
        size=48,
    } = props;
    const imageSize  = size === 24 ? 24 : null;

    React.useEffect(()=>{
        (async ()=>{
            const {
                profile,
            } = users.find(u => u.id === id);
            const base64Data = await getBase64Data(`${id}-image_${size}`);
            const _image     = base64Data?.data || profile[`image_${size}`];
            setImage(_image);
        })()
    }, [id])
    return (
        <ListItemAvatar style={{
            paddingTop:imageSize ? null : 8,
            minWidth : imageSize,
        }}>
            <Avatar style={{
                width  : imageSize,
                height : imageSize,
            }} variant="rounded" alt="" src={image} />
        </ListItemAvatar>
    )
}
