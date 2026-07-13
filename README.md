# PORTFOLIO-V1 大节点进度看板

这是自动交易系统的管理层视图，只展示会改变项目阶段的 9 个大节点。

- 看板页面每 60 秒读取一次最新 `progress.json`。
- GitHub Pages 会在 `main` 分支更新后自动重新发布。
- `37%` 是按 9 个预先固定大节点计算的工程进度，不是盈利概率，也不是实盘资格。
- 仓库只包含脱敏进度，不包含交易源码、API 密钥、账户、订单、持仓、日志、数据库或资金数据。

更新大节点时，只需修改 `progress.json`，验证 JSON 后提交到 `main`。

当前事实：`NO_VALIDATED_PORTFOLIO / NOT_ELIGIBLE / NOT_DEPLOYABLE`。
