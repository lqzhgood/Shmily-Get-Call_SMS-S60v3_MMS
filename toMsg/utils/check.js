const _ = require('lodash');


const noData = [];
const NotInserted = [];


function checkDataEqualFromNotInserted(mmsJSON) {
    const mHeaders = mmsJSON.headers;
    if (mHeaders.From === '<not inserted>') {
        NotInserted.push(mmsJSON);
    }
    if (!mHeaders.Date) {
        noData.push(mmsJSON);
    }

    console.log(_.isEqual(noData, NotInserted));
}

/**
 * @name:
 * @description: 如果 路径包含 predefsent 那么肯定是发送方 检查是否 not inserted
 * @param {*} mmsJSON
 * @param {*} mmsAssetDir
 * @return {*}
 */
function checkNotInsertedByPath(mmsJSON, mmsAssetDir) {
    const mHeaders = mmsJSON.headers;
    if (mmsAssetDir.includes('predefsent') && mHeaders.From !== '<not inserted>') {
        console.log('checkNotInsertedByPath', mmsAssetDir);
    }
}


/**
 * @name:
 * @description: 如果 路径包含 predefsent 那么肯定是发送方 检查 Data 是否为 null
 * @param {*} mmsJSON
 * @param {*} mmsAssetDir
 * @return {*}
 */
function checkNoDataByPath(mmsJSON, mmsAssetDir) {
    const mHeaders = mmsJSON.headers;
    if (mmsAssetDir.includes('predefsent') && mHeaders.Data) {
        console.log('checkNoDataByPath', mmsAssetDir);
    }
}









const go_To = [];
const come_To = [];
const come_From = [];

/**
 * @name:
 * @description: 获取发送和接收方的手机号(去重)
 * @param {*} mmsArrUniq
 * @return {*}
 */
function getUniqNumber(mmsArrUniq) {
    mmsArrUniq.forEach(v => {
        if (v.json.headers.From === '<not inserted>') {
            go_To.push(v.json.headers.To.replace('/TYPE=PLMN', ''));
        } else {
            come_To.push(v.json.headers.To.replace('/TYPE=PLMN', ''));
            come_From.push(v.json.headers.From.replace('/TYPE=PLMN', ''));
        }
    });

    console.log('go_To', Array.from(new Set(go_To)));
    console.log('come_To', Array.from(new Set(come_To)));
    console.log('come_From', Array.from(new Set(come_From)));
}


module.exports = {
    checkDataEqualFromNotInserted,
    checkNotInsertedByPath,
    checkNoDataByPath,
    getUniqNumber,
};