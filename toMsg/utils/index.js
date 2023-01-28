/* cSpell:ignore smil */
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { AMR_To_Mp3_TAG } = require('../config');

function readUTF8Bom(p) {
    let bf = fs.readFileSync(p);
    if (bf[0] === 0xEF && bf[1] === 0xBB && bf[2] === 0xBF) {
        bf = bf.slice(3);
    }
    return bf.toString('utf-8');
}



const TAG_ARR = {
    "smil": 'div',
    "head": 'div',
    "layout": null,
    "root-layout": null,
    "region": null,
    "body": 'div',
    "par": 'div',
    "img": null,
    "text": 'p',
    "audio": null,
    "param": null,
    "?xml": null,
};

const SMIL_TAG = Object.keys(TAG_ARR);

function smilToHTMLByPath(fp) {
    const smil = fs.readFileSync(fp, 'utf-8');
    // 得到当前xml中所有的 tag
    const tagArr = smil.match(/<.+?( |\/|>)/gim).map(h => h.replace(/(<|\s|>|\/)/igm, ''));
    const uniqTagArr = _.uniq(tagArr);
    // 找到没有在 TAG_ARR 内的 Tag
    const accident = _.difference(uniqTagArr, SMIL_TAG);
    if (accident.length !== 0) {
        throw new Error(`\n${fp} \nnew Smil Tag ${accident}`);
    }
    // 替换相应的 Tag
    const html_1 = smil.replace(/<.+?( |\/|>)/gim, v => {
        const thisTag = v.replace(/(<|\s|>|\/)/igm, '');
        const replaceTag = TAG_ARR[thisTag] || thisTag;
        return v.replace(thisTag, replaceTag);
    });

    // 强制闭合补全闭合标签 防止以下情况
    // 如  <audio /><p>123</p>  --html解码-->  <audio><p>123</p></audio>
    const html_2 = html_1.replace(/<([^>]+?)\/>/gim, v => {
        const match = v.match(/(?<=(^<))([^>]+?)(?=( |\/>))/gim);
        if (!match) throw new Error(`not match tag ${v}`);
        const tag = match[0];
        return v.replace("/>", `></${tag}>`);
    });

    return html_2;
}


/**
 * @name:
 * @description: 针对某一个 .smil  处理 DOM 中 src 不对的情况
 * @param {*} p
 * @param {*} srcElm
 * @return {*}
 */
function fixSrc(p, srcElm, mmsJSON) {
    // 处理 src 多余的 cid
    Array.from(srcElm).forEach(elm => {
        elm.attribs.src = elm.attribs.src.replace(/^cid:/, '');
    });
    const srcArr = Array.from(srcElm).map(elm => elm.attribs.src);
    // 去掉多余的文件
    const files = findDirFiles(p, srcArr);
    // 去掉多余的 json(.smil)
    const dataJSON = mmsJSON._data_parts.filter(d => d.headers['Content-Type'][0] !== "application/smil");
    const dataJSONFile = dataJSON.map(d => d.content_type_parameters.Name);
    if (_.xor(dataJSONFile, files).length !== 0) {
        throw new Error('JSON 和 实际文件不符');
    }





    // 开始fixSrc

    // 目录的文件和src指向的文件一一对应则不需要 fix. 直接返回
    if (_.xor(srcArr, files).length === 0) return;

    // 匹配 JSON中有映射关系存在的情况
    const isJsonMatch = redirectFiles(srcElm, files, dataJSON, p);
    if (isJsonMatch) return;

    // 剩下的应该就是 文件和src 不能 [完全] 匹配的了
    // 这里按照先匹配完全 再按 src/json 顺序匹配(相同后缀)
    // 这里的 dataJSON 是没有  fileMap 的,因为 fileMap 要么全有,要么全无.
    // 全有的在上面 redirectFiles 已经处理完了
    // 所有这里 dataJSON 只是为了导出了 完全没有匹配的按照 dataJSON 的顺序匹配
    const isExceptionMatch = matchException(srcElm, dataJSONFile, p);
    if (isExceptionMatch) return;

    // 理论上全部数据都会在上面三种方式匹配完成 不会倒这里来, 所以这里打印出来的都是错误的数组
    console.warn(p, srcArr, dataJSON, files);

}


/**
 * @name:
 * @description: 匹配剩余的
 * @param {*}
 * @return {*}
 */
function matchException(srcElm, dataJSONFile, p) {
    const canNotMatch = [];
    const _filesFromJson = _.cloneDeep(dataJSONFile);
    Array.from(srcElm).forEach(elm => {
        const fIndex = _filesFromJson.findIndex(f => f === elm.attribs.src);
        if (fIndex !== -1) {
            _filesFromJson.splice(fIndex, 1);
        } else {
            canNotMatch.push(elm);
        }
    });

    // 剩下的就直接按顺序匹配了
    for (let i = 0; i < canNotMatch.length; i++) {
        const src = canNotMatch[i].attribs.src;
        const fi = _filesFromJson.findIndex(f => path.extname(f).toLowerCase() === path.extname(src).toLowerCase());
        canNotMatch[i].attribs.src = _filesFromJson.splice(fi, 1)[0];
        canNotMatch[i] = undefined;
    }

    if (canNotMatch.filter(v => v).length !== 0 || _filesFromJson.length !== 0) {
        console.log(p, canNotMatch, _filesFromJson);
        // 理论上不会倒这里来的  这里所有文件都已经匹配完了 数组长度应该都是 0
        return false;
    }

    return true;
}


/**
 * @name:
 * @description: 如果 json _data_parts headers 对象中有 .smil src 和文件的对应关系
 *               覆写 src 为真实文件
 * @param {*}
 * @return {*}
 */
function redirectFiles(srcElm, files, dataJSON, p) {
    let haveFileMap = 0;
    for (let i = 0; i < dataJSON.length; i++) {
        const d = dataJSON[i];
        if (Object.keys(d.headers).length >= 2) {
            haveFileMap++;
        }
    }

    if (haveFileMap === 0) {
        // 如果是0 则说明没有 map
        return false;
    } else if (haveFileMap == srcElm.length) {
        // 说明每个都有 map
        // 这里不作处理 直接往下运行
    } else {
        // 这里是部分有 map  直接报错提醒
        // 经测试 这种情况应该不存在
        console.log(p, srcElm, dataJSON);
        throw new Error('json not all have file map');
    }

    // "headers": {
    //     "Content-Type": [
    //         "image/jpeg",
    //         {
    //             "Name": "img_04.jpg"
    //         }
    //     ],
    //         "att000.jpg": "À\"<att000.jpg>"
    // }
    const fileMap = dataJSON.map(v => {
        const file = v.headers['Content-Type'][1].Name;
        if (!files.includes(file)) {
            // JSON 里面说存在 但是现实文件不存在  直接报错.
            // 当然这里可以直接用 json 里面生成文件
            // 但是因为这里已经有了真实文件 所以我不再处理了
            throw new Error(`${p} - ${file} is not exist`);
        }
        const src = Object.keys(v.headers).filter(hk => hk !== 'Content-Type')[0];
        return { file, src };
    });


    Array.from(srcElm).forEach(elm => {
        const src = elm.attribs.src;
        const m = fileMap.find(v => v.src === src);
        if (!m) {
            // 理论上不存在
            throw new Error(`map can't matching`);
        }
        elm.attribs.src = m.file;
    });

    return true;
}





/**
 * @name:
 * @description: 检查 [src] 数量和这个目录下文件数量是否一致
 *               例外是 index.html 和 .smil 文件
 *               及 amr 转换的 MP3 （文件名结尾有 AMR_To_Mp3_TAG 标签）
 *               1.amr -- > 1${AMR_To_Mp3_TAG}.mp3
 * @param {*} p
 * @param {*} srcElm
 * @return {*} 过滤后的文件数组
 */
function findDirFiles(p, srcArr) {
    const files = fs.readdirSync(p).filter(f => {
        const { ext, name } = path.parse(f);
        if (f === 'index.html') return false;
        if (name.endsWith(AMR_To_Mp3_TAG)) return false;
        if (ext.toLowerCase() === '.smil') return false;
        return true;
    });
    if (files.length !== srcArr.length) throw new Error(` src file not all exist ${p}`);
    return files;
}




module.exports = {
    readUTF8Bom,
    smilToHTMLByPath,
    fixSrc,
};