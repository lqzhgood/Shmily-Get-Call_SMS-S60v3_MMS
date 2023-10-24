# Shmily-Get-Call_SMS-S60v3_MMS

# 说明

请先阅读 https://github.com/lqzhgood/Shmily

此工具是将 `Symbian S60v3 彩信` 解密并转换为 `Shmily-Msg` 格式的工具

## 使用

```
.
├─ decode
│  ├─ mms.py
│  │  ...
│  └─ readme.md
├─ input
│  ├─ Nokia 6120c ( $msg Device name )
│  │  └─ (任意层级目录)
│  │  └─ predefinbox
│  │    └─ ...
│  │  └─ predefsent
│  │        ├─ 0001
│  │        │   └─ 1.jpg
│  │        │   └─ 1.html
│  │        └─ 0001.mms
│  └─ readme.md
├─ toMsg
│  │  └─ dist
│  │  └─ ...
│  └─  index.js
└─ readme.md
```

1. 获取彩信文件

    - 使用 Nokia 套件( .\toMsg\Tool\Nokia_PC_Suite_ALL_7.1.180.94.exe) 导出手机彩信
    - 放入 `.\input\${device}\` 文件夹

2. 解码彩信头部信息 (记录内容为收发号码及附件信息等)

    - 进入 `decode` 目录,
    - 执行 `python mms.py` 后, 会在 `predefsent` 下生成 `0001.mms.json`, 这是彩信的头信息
    - 注意
        - 获取的时间时区是错误的, 会在第三步修复
        - 时间有可能错误 查看 `toMsg` 中的 readme.md

3. 数据文件 和 资源文件

    - 进入`toMsg`目录
    - 安装 node 环境 [http://lqzhgood.github.io/Shmily/guide/setup-runtime/nodejs.html]
    - 修改 `config.js`
    - 执行 `npm run build`
    - 在 `dist` 文件夹中获得

## 其他
`Tool` 和 `doc` 等可以参考 `Symbian S60v3 SMS 短信` 导出  [Shmily-Get-Call_SMS-S60v3_SMS](https://github.com/lqzhgood/Shmily-Get-Call_SMS-S60v3_SMS)

## 感谢

http://lqzhgood.github.io/Shmily/guide/other/thanks.html

## 捐赠

点击链接 http://lqzhgood.github.io/Shmily/guide/other/donation.html 看世界上最可爱的动物
