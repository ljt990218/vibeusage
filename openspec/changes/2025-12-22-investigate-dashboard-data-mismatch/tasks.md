# 2025-12-22-investigate-dashboard-data-mismatch 任务清单

## 0. 代码核查
- [x] 0.1 核对时区参数链路（前端 `tz`/`tz_offset_minutes` → 后端 `getUsageTimeZoneContext` 实际忽略）。

## 1. 复现与取证
- [x] 1.1 复现“前端拿不到数据”的页面与时间（记录浏览器与账号）。
- [x] 1.2 记录 Network 请求：`vibescore-usage-summary`/`daily`/`hourly`/`heatmap`/`leaderboard` 的 URL、参数、状态码、响应体。
- [ ] 1.3 记录前端控制台错误与重试行为（含时间戳）。

## 2. 后端对照验证
- [ ] 2.1 用同一用户 JWT 直连调用 usage endpoints（包含/不包含 `tz` 参数），对比响应字段（`days`、`data`、`totals`）。
- [ ] 2.2 对照数据库视图/表的可用性（`vibescore_tracker_daily`、`events`）与是否返回空集。
- [ ] 2.3 若返回 401/403/500，记录 `status` 与 `error`/`code`。

## 3. 时区一致性排查
- [x] 3.1 确认 Dashboard 是否发送 `tz` 或 `tz_offset_minutes`（IANA/offset）。
- [ ] 3.2 确认后端是否按时区聚合（UTC vs 本地日/月/小时路径）。
- [ ] 3.3 核对 UI 文案与标签是否标示时区基准（UTC 或 local）。

## 4. 结论与修复建议
- [ ] 4.1 明确根因（前端参数、后端响应、权限、时区错位）。
- [ ] 4.2 输出修复方案与验收标准（含需要的 spec 更新/测试）。

## 证据记录
- 复现时间：2025-12-22T18:07:00Z（Chrome DevTools MCP；账号=REDACTED）
- 认证方式：`/auth/callback?access_token=REDACTED`
- 请求与响应概览（本次未触发 `hourly`/`leaderboard`）：
  - `GET /functions/vibescore-usage-daily?from=2025-12-22&to=2025-12-28&tz=Asia/Shanghai&tz_offset_minutes=480` → 200，`data` 仅含 `2025-12-22`
  - `GET /functions/vibescore-usage-heatmap?weeks=52&to=2025-12-23&week_starts_on=sun&tz=Asia/Shanghai&tz_offset_minutes=480` → 200，`active_days=33`，`streak_days=0`
  - `GET /functions/vibescore-usage-summary?from=2025-12-23&to=2025-12-23` → 200，`days=0`，`totals=0`
- UI 现象：`IDENTITY_CORE` 显示 `STREAK 0_DAYS`；每日表格 `2025-12-23` 显示 `未同步`；时区标签为 `LOCAL TIME (UTC+08:00)`
- 代码现状：`insforge-src/shared/date.js` 内 `getUsageTimeZoneContext` 处于 Phase 1，直接返回 `normalizeTimeZone()`，忽略 `tz`/`tz_offset_minutes`，usage endpoints 实际走 UTC 聚合。
