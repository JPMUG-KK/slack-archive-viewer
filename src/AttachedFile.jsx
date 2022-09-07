import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import DescriptionIcon from '@material-ui/icons/Description';
import {
    getBase64Data,
} from './utility.js';
const useStyles = makeStyles(theme => ({
    attachmentImage : {
        maxWidth : 360,
        maxHeight : 240,
        borderRadius : 4,
    },
    fileBox : {
        display : 'flex',
        alignItems : 'center',
        textDecoration : 'none',
        color : '#34495e',
        border : 'solid 1px #ddd',
        borderRadius : 4,
        //minHeight : 48,
        padding : 8,
        paddingRight : 12,
        marginTop : 4,
        //width : 360,
    },
}));


export default function UserAvatar(props) {
    const {
        file={},
    } = props;

    const [fileParams, setFileParams] = React.useState(null);
    const {
        id,
        mimetype='',
        name,
        url_private,
    } = file;

    const classes = useStyles();
    const FileComponent = () => {
        if(!fileParams) return null;
        const {
            contentType,
            data,
            isBase64=false,
        } = fileParams;
        if(contentType.search(/image/) > -1){
            return (
                <a 
                    key={id} 
                    id={id} 
                    className={classes.fileBox} 
                    style={{padding : 0}} 
                    href={data} 
                    download={isBase64 ? name : null} 
                    target={isBase64 ? null : '_blank'} 
                    rel={isBase64 ? null : 'noopener noreferrer'}
                >
                    <img key={`image-${id}`} src={data} className={classes.attachmentImage} />
                </a>
            )
        }
        return (
            <a 
                key={id} 
                id={id} 
                className={classes.fileBox} 
                href={data} 
                download={isBase64 ? name : null} 
                target={isBase64 ? null : '_blank'} 
                rel={isBase64 ? null : 'noopener noreferrer'}
            >
                <DescriptionIcon style={{paddingRight : 8}} /> {name}
            </a>
        )
    };
    React.useEffect(()=>{
        (async () => {
            let _fileParams = {
                contentType : mimetype,
                data        : url_private,
                isBase64    : false,
            }
            const base64Data = await getBase64Data(id);
            if(base64Data){
                _fileParams = {
                    contentType : base64Data.contentType,
                    data        : base64Data.data,
                    isBase64    : true,
                }
            }
            setFileParams(_fileParams);
        })();
    }, [id]);
    return (
        <FileComponent />
    );
}
