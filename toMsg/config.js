const dayjs = require('dayjs');

module.exports = {
    PUBLIC_DIR: '/data/sms_s60_mms',

    // 本人发出信息的号码 拿不到
    rightNum: '_110',
    // 本人在对方手机里的昵称也不知道
    rightName: 'name，',

    // 号码里面能拿到 后面会被覆写
    leftNum: '_333',
    // 对方号码在本人通讯录的名称
    leftName: '_name',

    // 过滤出需要的彩信
    filterMMS: {
        go: {
            // 去电号码
            to: [110],
        },
        come: {
            // 来电号码
            from: [110, 119],
        },
        // 使用 md5 排除一些不需要的彩信
        removeMd5: ['8319401e0c3b278364f7fd9ff704955a'],
    },

    // 手动修复一些彩信的时间
    fixTime: {
        'f155a4321af595928e2425a8c35cd1f8': dayjs('2010/03/10 08:06:02').valueOf() - 1,
        '3b7e341b439f2533f606497e9ba5d092': '2010/03/14 15:36:32',
        'd1e82e848365a8652b96814f67032931': '2011/08/29 11:00:16',
    },

    // 如果没有时间, 使用的默认时间
    GO_DEFAULT_TIME: '2000/01/01 00:00:00',

    // 图片类型特殊处理 (增加 img 标签进行预览 )
    IMG_TYPE: ['.png', '.gif', '.jpg', '.jpeg', '.webp'],
    // 特殊替换标记 不要修改
    AMR_To_Mp3_TAG: '__AMR_To_Mp3_TAG__',
};
