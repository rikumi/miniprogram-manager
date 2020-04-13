# miniprogram-manager

微信小程序版本管理自动工具

## 功能

- 根据版本备注精确查找开发版 ID
- 设置体验版
- 获取当前体验版 ID
- 取消体验版
- 提交审核
- 发布已审核的版本

## 用法

注意：登录态会持久化保存在模块目录下，时效与浏览器一致。

- `mpman get-qr <username> <password> <qrcode-path>`: 获取登录二维码，保存在指定路径（若已登录，则直接跳过）
- `mpman await-login`: 等待扫码登录（若已登录，则直接跳过）
- `mpman search-version <version-desc>`: 精确查找指定的开发版的 ID
- `mpman get-exp`: 获取当前体验版的 ID
- `mpman set-exp <version-id>`: 设置体验版
- `mpman del-exp`: 删除当前体验版
- `mpman submit <version-id> <description>`: 提交审核
- `mpman logout`: 退出当前登录
