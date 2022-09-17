import Encoding from 'encoding-japanese';
import {Zlib} from '../node_modules/zlibjs/bin/unzip.min.js';
import moment from 'moment';
import Dexie from 'dexie';
import emojiSlack from './json/emoji-slack.json';

const db = new Dexie('slackViewerDB');
db.version(1).stores({
    store: '&id',
});
const unzipSlackExportFiles = (event, callback) => {
    const zipfile = event.target.files?.[0] || null;

    if(!zipfile){
        alert('Please select a zip file');
        return;
    }
    const slackName  = zipfile.name.replace(/\sSlack\sexport.*zip$/, '');
    const fileReader = new FileReader();

    fileReader.onload = function(evt) {
        const buffer = evt.target.result;
        const uint8Array = new Uint8Array(buffer);
        const unzip = new Zlib.Unzip(uint8Array);
        const lists = unzip.getFilenames();
        const slackData = {
            setting  : {},
            channels : {}, 
            workSpace: slackName,
        };
        lists.forEach(list => {
            const name = Encoding.convert(list,"UNICODE","AUTO");
            if(list.slice(-1) !== '/'){
                //console.log({name});
                const dataAsU8Array = unzip.decompress(list);
                const jsonString = Buffer.from(dataAsU8Array).toString('utf8');
                const json = JSON.parse(jsonString);
                const path = name.split('/');
                if(path.length > 1){
                    const [
                        pathName,
                        fileName,
                    ] = path;
                    const yyyymmdd = fileName.replace('.json', '');
                    if(slackData.channels[pathName] === undefined){
                        slackData.channels[pathName] = {};
                    }
                    slackData.channels[pathName][yyyymmdd] = json;
                }else{
                    slackData.setting[name.replace('.json', '')] = json;
                }
            }
        });
        //console.log({slackData});
        callback({
            [slackName] : slackData,
        }, slackName);
    };
    fileReader.readAsArrayBuffer(zipfile);
}
const convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
});
const fetchFile = async (params) => {
    const {
        id,
        url,
    } = params;
    let successfulToSave = false;
    const file = await fetch(url)
        .then(res => {
            if(res.status === 200){
                return res.blob().then(blob => ({
                    contentType: res.headers.get("Content-Type"),
                    blob: blob
                }));
            }
            throw new Error('File does not exist');

        })
        .catch(err => {
            console.error(err)
            return null;
        });
    if(file){
        const {
            blob,
            contentType,
        } = file;
        const base64 = await convertBlobToBase64(blob);
        db.store.put({
            id          : id, 
            contentType : contentType,
            data        : base64,
        });
        successfulToSave = true;
    }
    return {
        id,
        successfulToSave,
    };
}
const getChannelFiles = (data) => {
    const files = Object.keys(data).flatMap(channel => {
        return Object.keys(data[channel]).flatMap(date => {
            return data[channel][date]
                .filter(log => log.files)
                .flatMap(log => {
                    return log.files.map(file => {
                        const {
                            id,
                            url_private : url,
                        } = file;
                        return {
                            id,
                            url,
                        }
                    })
                })
        })
    });
    return files;
}
const getAvaterFiles = (data) => {
    const files = data.flatMap(user => {
        const {
            id,
            profile,
        } = user;
        const {
            image_24,
            image_48,
        } = profile;
        return [{
            id  : `${id}-image_24`,
            url : image_24,
        },{
            id  : `${id}-image_48`,
            url : image_48,
        }]
    });
    return files;
}
const importDb = async (data, callBack) => {
    const workSpacesData = await getCurrentWorkSpacesData();
    workSpacesData[data.workSpace] = {...data};
    const workSpaces = {
        id   : 'workSpaces',
        data : workSpacesData,
    }
    db.store.put(workSpaces);

    const channelFiles = getChannelFiles(data.channels);
    const avatarFiles  = getAvaterFiles(data.setting.users);

    const importFiles = avatarFiles.concat(channelFiles);
    const results = await Promise.all(importFiles.map(async (params)=>{
        const result = await fetchFile(params);
        return result;
    }));
    callBack(results);
}
const getCurrentWorkSpacesData = async () => {
    const workSpacesData = await getBase64Data('workSpaces');
    return workSpacesData?.data || {};
}
const getBase64Data = async (id) => {
    const data = await db.store.get(id);
    return data;
}
const emojiSupport = (text) => {
    return (text || '').replace(/:([a-z0-9_+-]+)?:/gi, (value, text) => {
        const slackEmoji = emojiSlack[text] || undefined;

        if(!slackEmoji){
            console.log(`${value}\n${text}`);
        }
        return slackEmoji;
    });
}
export {
    unzipSlackExportFiles,
    fetchFile,
    importDb,
    getBase64Data,
    getCurrentWorkSpacesData,
    emojiSupport,
}