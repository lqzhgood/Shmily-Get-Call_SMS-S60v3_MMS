const path = require('path');
const dayjs = require('dayjs');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const config = require('../config');

//  右往左
// {
//     "_data_parts": [],
//     "_metaTags": {},
//     "_mms_message": null,
//     "_pages": [],
//     "headers": {
//         "Content-Type": [
//             "application/vnd.wap.multipart.related",
//             {
//                 "Start": "<945562154>",
//                 "Type": "application/smil"
//             }
//         ],
//         "Delivery-Report": true,
//         "From": "<not inserted>",
//         "MMS-Version": "1.2",
//         "Message-Class": "Personal",
//         "Message-Type": "m-send-req",
//         "Priority": "Normal",
//         "Read-Reply": false,
//         "Subject": "猪头，买书",
//         "To": "15211177134/TYPE=PLMN",
//         "Transaction-Id": "1234"
//     },
//     "height": 220,
//     "subject": "test",
//     "transactionID": "12345",
//     "width": 176
// }

// 左往右
// "_data_parts":[],
// "_metaTags": {},
// "_mms_message": null,
// "_pages": [],
// "headers": {
//     "Content-Type": [
//         "application/vnd.wap.multipart.mixed",
//         {}
//     ],
//     "Date": "2009-11-01 22:47:04",
//     "Delivery-Report": false,
//     "From": "+8615211177134/TYPE=PLMN",
//     "MMS-Version": "1.2",
//     "Message-Class": "Personal",
//     "Message-Type": "m-send-req",
//     "Priority": "Normal",
//     "Read-Reply": false,
//     "Subject": "看美女！",
//     "To": "+8615211466561/TYPE=PLMN",
//     "Transaction-Id": "1234"
// },
// "height": 220,
// "subject": "test",
// "transactionID": "12345",
// "width": 176

// {
//     "source": "SMS",
//     "device": "Phone",
//     "type": "",
//     "direction": "come",
//     "sender": "18974125500",
//     "senderName": "_孔令猪",
//     "receiver": "_13367416941",
//     "receiverName": "_",
//     "day": "2013-12-26",
//     "time": "20:56:00",
//     "ms": 1388062560000,
//     "content": "你要是真的回来了 我现在也出不来。你早点回家咯。",
//     "html": "你要是真的回来了 我现在也出不来。你早点回家咯。",
//     "msAccuracy": true
// },

function toMsg(obj) {
    const { md5, fixDate, dir, direction, json: mmsJSON } = obj;
    const device = dir.split(path.sep)[2];

    const { headers } = mmsJSON;
    const { From, To, Date: date, Subject = '' } = headers;

    const send = {};
    const receive = {};

    if (direction === 'go') {
        //  From <not inserted>
        send.sender = config.rightNum;
        send.senderName = config.rightName;

        receive.receiver = To.replace('/TYPE=PLMN', '');
        receive.receiverName = config.leftName;
    }

    if (direction === 'come') {
        send.sender = From.replace('/TYPE=PLMN', '');
        send.senderName = config.leftName;

        receive.receiver = To.replace('/TYPE=PLMN', '');
        receive.receiverName = config.rightName;
    }

    let _d;
    if (fixDate) {
        _d = dayjs(fixDate);
    } else if (date) {
        _d = dayjs(date).add(8, 'hour');
    } else if (direction === 'go') {
        _d = dayjs(config.GO_DEFAULT_TIME);
        console.warn(`direction === go not have Date`, obj);
    } else {
        throw new Error(`direction === come not have Date `);
    }

    const subjectHtml = Subject ? `<h4>${Subject}</h4><br/>` : '';
    const html = (subjectHtml + publicFileHandle(obj)).replace(/\n/g, '<br/>');

    const $ = cheerio.load(html.replace(/<br\/>/g, '\n'));

    const msg = {
        source: 'SMS',
        device,
        type: '彩信',

        direction,

        ...send,
        ...receive,

        day: _d.format('YYYY-MM-DD'),
        time: _d.format('HH:mm:ss'),
        ms: _d.valueOf(),

        content: $.text(),
        html,

        msAccuracy: false,

        $SMS: {
            type: 's60_sms',
        },
    };

    return msg;
}

function publicFileHandle(obj) {
    const { md5, dir } = obj;
    const html = fs.readFileSync(path.join(dir, 'index.html'));
    const $ = cheerio.load(html);

    const i = path.join(dir);
    const o = path.join('./dist', config.PUBLIC_DIR, md5);
    fs.copySync(i, o);

    Array.from($('[src]')).forEach(elm => {
        const url = `${config.PUBLIC_DIR}/${md5}/${elm.attribs.src}`;
        elm.attribs.src = encodeURI(url);
    });
    Array.from($('[href]')).forEach(elm => {
        const url = `${config.PUBLIC_DIR}/${md5}/${elm.attribs.href}`;
        elm.attribs.href = encodeURI(url);
    });

    return $.html();
}

module.exports = {
    toMsg,
};
