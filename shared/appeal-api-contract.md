# API Contract: Fair-Play Appeal Tribunal (Homework 2)

Hợp đồng giữa `Homework2_Lab04/client` và `Homework2_Lab04/server`, viết trước khi code. Muốn đổi gì thì sửa file này trước.

## 1. Quy ước chung

| Mục | Giá trị |
|---|---|
| Base URL (dev) | `http://localhost:3003` (client đọc từ `VITE_API_BASE`) |
| Định dạng | JSON, `Content-Type: application/json`, body tối đa 20kb |
| CORS | Chỉ cho `CLIENT_ORIGIN`, mặc định `http://localhost:5175` |
| Lưu trữ | Trong bộ nhớ: khởi động lại server thì mất đơn và hạn SLA được tính lại |
| Hạn SLA | `appealDeadline = serverStartedAt + SLA_HOURS * 3_600_000` (ms epoch). `SLA_HOURS` mặc định 48 |
| Luật validation | `Homework2_Lab04/shared/appealRules.js`, dùng chung cho client và server |

## 2. Kiểu dữ liệu

```js
/** @typedef {'friendly-match'|'no-explicit-rule'|'not-notified'|'disproportionate'} Ground */
/** @typedef {{ email: string, grounds: Ground[], statement: string, evidenceUrl: string, confirm: boolean }} AppealInput */
/** @typedef {AppealInput & { id: string, playerId: string, submittedAt: number }} Appeal */
/** @typedef {{ eventTier: 'exhibition'|'official', ruleExplicit: boolean, notified: boolean, priorOffenses: number }} CaseFactors */
/** @typedef {{ issuer: string, issuedAt: string, kind: 'warning'|'match-ban'|'1-year'|'permanent', scope: string }} Sanction */
/**
 * @typedef {{ id: string, name: string, realName: string, summary: string, accusation: string,
 *   sanction: Sanction, factors: CaseFactors, sources: { title: string, url: string }[],
 *   appealDeadline: number, appeal: Appeal|null }} Dossier
 */
/** @typedef {Partial<Record<keyof AppealInput, string>>} Errors */
/** @typedef {{ error: string, fields?: Errors }} ErrorBody */
```

## 3. Route

| Route | Thành công | Lỗi |
|---|---|---|
| `GET /api/time` | `200 { now: number }` | |
| `GET /api/dossiers` | `200 [{ id, name, appealDeadline, hasAppeal }]` | |
| `GET /api/dossiers/:playerId` | `200 Dossier` | `404 'Dossier not found'` |
| `POST /api/dossiers/:playerId/appeals` | `201 Appeal` | `404 'Dossier not found'`, `400 'Body must be a JSON object'`, `400 { error: 'Validation failed', fields }`, `409 'Appeal window closed'`, `409 'Appeal already submitted'` |

`POST` kiểm tra theo thứ tự: hồ sơ có tồn tại không (404), body có hợp lệ không (400), còn hạn không (409, hết hạn khi `now >= appealDeadline`), đã nộp chưa (409). Đơn được lưu là `toAppeal(body)` cộng `id`, `playerId`, `submittedAt`.

Lỗi chung, chốt nguyên văn: `400 'Invalid JSON'`, `413 'Payload too large'`, `404 'Not found'`, `500 'Internal server error'`.
