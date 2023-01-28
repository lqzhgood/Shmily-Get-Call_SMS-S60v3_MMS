/* cSpell:ignore smil */

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const md5File = require('md5-file');

const { checkDataEqualFromNotInserted, checkNotInsertedByPath, checkNoDataByPath } = require('./utils/check');

const { toMsg } = require('./lib/conversion');
const { makerHtmlFile } = require('./lib/html');
const { filterMMS, fixTime } = require('./config');

const mmsArrAll = [];

if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
}

(async () => {
    try {
        await foundMMS('../input');

        const mmsArrUniq = _.uniqBy(mmsArrAll, v => v.md5 + JSON.stringify(v.json));
        const mmsArrUniqFilter = mmsArrUniq.filter(v => {
            if (filterMMS.removeMd5.some(f => f === v.md5)) return false;
            if (v.direction === 'go') {
                return filterMMS.go.to.some(n => v.json.headers.To.includes(n));
            } else {
                return filterMMS.come.from.some(n => v.json.headers.From.includes(n));
            }
        });
        console.log('mmsArrUniqFilter.length', mmsArrUniqFilter.length);

        console.warn('无日期信息长度', mmsArrUniqFilter.filter(v => !v.fixDate && !v.json.headers.Date).length);

        const msgArr = mmsArrUniqFilter.map(v => toMsg(v));

        const msgArrSort = _.sortBy(msgArr, 'ms');
        console.log('msgArrSort', msgArrSort.length);
        fs.writeFileSync('./dist/sms_s60v3_mms_confirm.json', JSON.stringify(msgArrSort, null, 4));
        console.log('ok');
    } catch (error) {
        console.log(error);
    }
})();

async function foundMMS(p) {
    const files = fs.readdirSync(p);
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const sPath = path.join(p, f);
        const { ext, dir, name, base } = path.parse(sPath);
        const sate = fs.statSync(sPath);
        if (sate.isDirectory()) {
            await foundMMS(sPath);
        } else if (ext.toLocaleString() === '.mms') {
            // 文件结尾可以有空格 文件夹结尾不能有空格
            const mmsAssetDir = path.join(dir, name).trim();
            const jsonDir = path.join(dir, `${base}.json`);
            const mmsJSON = require(jsonDir);
            await makerHtmlFile(mmsAssetDir, mmsJSON);

            const md5 = md5File.sync(jsonDir);
            const fixDate = fixTime[md5];

            mmsArrAll.push({
                md5,
                fixDate,
                direction: mmsJSON.headers.From === '<not inserted>' ? 'go' : 'come',
                dir: mmsAssetDir,
                json: mmsJSON,
            });
            // checkDataEqualFromNotInserted(mmsJSON);
            // checkNotInsertedByPath(mmsJSON, mmsAssetDir);
            // checkNoDataByPath(mmsJSON, mmsAssetDir);
        }
    }
}
