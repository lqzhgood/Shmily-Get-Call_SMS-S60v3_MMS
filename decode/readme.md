
### 解析

使用 `python-messaging` 库对 `mms` 文件进行解析,生成相应位置的 json 文件,内含 `mms headers` 信息 <br/>
因为 `NbuExplorer` 已经可以导出 `mms` 和 `mms.body / mms.part` 信息,所以这里只需要 headers 就可以了. 然后通过 js 组装成 msg