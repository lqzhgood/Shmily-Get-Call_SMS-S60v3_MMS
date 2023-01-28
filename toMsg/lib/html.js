/* cSpell:ignore smil */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const amrToMp3 = require('amrToMp3');

const { AMR_To_Mp3_TAG, IMG_TYPE } = require('../config');

const { readUTF8Bom, smilToHTMLByPath, fixSrc } = require('../utils/index');


async function makerHtmlFile(mmsAssetDir, mmsJSON) {
    const files = fs.readdirSync(mmsAssetDir.replace(/\s/g, ' '));
    const smilFile = files.find(v => /\.smil$/i.test(v));
    if (smilFile) {
        await makeIndexHtml(mmsAssetDir, smilFile, mmsJSON);
    } else {
        // console.warn(`not have smil ${mmsAssetDir}`, fs.readdirSync(mmsAssetDir), mmsJSON);
        makeUnSmilIndexHtml(mmsAssetDir, mmsJSON);
    }
}


function makeUnSmilIndexHtml(mmsAssetDir, mmsJSON) {
    const files = fs.readdirSync(mmsAssetDir).filter(f => {
        const { name } = path.parse(f);
        return f !== 'index.html' && !name.endsWith(AMR_To_Mp3_TAG);
    });
    const pFirstFiles = files.sort((a, b) => {
        const a_ext = path.extname(a);
        return IMG_TYPE.some(t => t === a_ext.toLowerCase()) ? -1 : 1;
    });
    let html = '';
    pFirstFiles.forEach(f => {
        const { ext, base } = path.parse(f);
        if (IMG_TYPE.some(t => t == ext.toLowerCase())) {
            html += `<img src="${base}" />`;
        } else if (ext.toLowerCase() === '.txt') {
            const text = readUTF8Bom(path.join(mmsAssetDir, f));
            html += `<p>${text}</p>`;
        } else {
            throw new Error(`未处理的文件类型 ${mmsAssetDir} ${f}`);
        }
    });
    fs.writeFileSync(path.join(mmsAssetDir, 'index.html'), html);
}



async function makeIndexHtml(p, f, mmsJSON) {
    //  字符串级处理
    const html = smilToHTMLByPath(path.join(p, f));

    // DOM 级处理
    const $ = cheerio.load(html);
    fixSrc(p, $("[src]"), mmsJSON);

    // .text
    const ps = $("p");
    for (let i = 0; i < ps.length; i++) {
        const n = ps[i];
        const n_src = n.attribs.src;
        const txt = readUTF8Bom(path.join(p, n_src));
        $(n).html(txt);
    }

    // .amr
    const as = $("audio");
    for (let i = 0; i < as.length; i++) {
        const n = as[i];
        const n_src = n.attribs.src;
        const { ext, base, name } = path.parse(n_src);
        if (ext.toLocaleLowerCase() === '.amr') {
            await amrToMp3(path.join(p, base), p, `${name}${AMR_To_Mp3_TAG}`);
            n.attribs.src = `${name}${AMR_To_Mp3_TAG}.mp3`;
            $(n).after(`<a href="${base}" download="${base}">下载 ${base}</a>`);
        }
        $(n).attr('controls', true);
    }
    fs.writeFileSync(path.join(p, 'index.html'), $.html());
}


module.exports = {
    makerHtmlFile,
};