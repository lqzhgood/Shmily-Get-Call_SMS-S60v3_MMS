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

1. 彩信文件

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

## 感谢

https://github.com/pmarti/python-messaging

https://sourceforge.net/projects/nbuexplorer/
