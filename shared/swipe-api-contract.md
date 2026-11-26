# API Contract — Card-Swipe Deck (Homework 1 Lab 04)

Hợp đồng giữa `Homework1_Lab04/client` và `Homework1_Lab04/server`. Viết trước khi code (contract-first). Mọi thay đổi phải sửa file này trước, rồi mới sửa client và server. Thiết kế: [spec](../docs/superpowers/specs/2026-11-26-hw1-swipe-deck-design.md).

## 1. Quy ước chung

| Mục | Giá trị |
|---|---|
| Base URL (dev) | `http://localhost:3002` (client đọc từ `VITE_API_BASE`) |
| Định dạng | JSON, `Content-Type: application/json`; body tối đa 10 kB |
| CORS | Chỉ cho origin `CLIENT_ORIGIN` (mặc định `http://localhost:5174`) |
| Lưu trữ | MongoDB 8 (`MONGODB_URI`), Mongoose 8 async/await |
| Id | `_id` của MongoDB trả ra dưới tên `id`, dạng chuỗi 24 ký tự hex |
| Lỗi | Luôn có body `{ "error": string }` |

## 2. Kiểu dữ liệu

```js
/** @typedef {'left'|'right'|'up'} Direction  left = Bỏ qua, right = Thích, up = Siêu thích */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} name     1 đến 40 ký tự
 * @property {number} age      18 đến 99
 * @property {'male'|'female'} gender
 * @property {string} bio      tối đa 140 ký tự
 */

/** @typedef {{ id: string, createdAt: string }} Game  createdAt: ISO 8601 */

/**
 * @typedef {Object} Swipe
 * @property {string} id
 * @property {string} gameId
 * @property {string} profileId
 * @property {Direction} direction
 * @property {string} createdAt  ISO 8601, server sinh
 */

/** @typedef {{ game: Game, swipes: Swipe[] }} GameState  swipes theo thứ tự tạo, cũ trước */
/** @typedef {{ error: string }} ErrorBody */
```

**Ván dở** là `Game` có `createdAt` mới nhất. Không có đăng nhập; app coi như một người chơi.

## 3. Route

### 3.1 GET /api/profiles

| Trường hợp | Mã | Body |
|---|---|---|
| Thành công | `200` | `Profile[]` theo thứ tự `_id` (thứ tự nạp seed) |

Hồ sơ chỉ được nạp bằng script `npm run seed`; không có API ghi hồ sơ. Seed **xoá luôn mọi ván và lượt quẹt** (hồ sơ mới có id mới, swipe cũ sẽ trỏ vào hồ sơ không còn tồn tại); lần mở app kế tiếp bắt đầu ván mới.

### 3.2 GET /api/games/current

| Trường hợp | Mã | Body |
|---|---|---|
| Có ván dở | `200` | `GameState` của ván dở |
| Chưa có ván nào | `200` | Tạo ván mới rồi trả `GameState` với `swipes: []` |

### 3.3 POST /api/games

Bắt đầu ván mới. Không cần body. Ván cũ vẫn giữ trong DB.

| Trường hợp | Mã | Body |
|---|---|---|
| Thành công | `201` | `GameState` với `swipes: []` |

### 3.4 POST /api/games/:gameId/swipes

Ghi một lượt quẹt. Body yêu cầu:

```json
{ "profileId": "6745f0c2a1b2c3d4e5f60718", "direction": "right" }
```

Khoá thừa (kể cả `id`, `createdAt`) bị bỏ qua.

| Trường hợp | Mã | Body |
|---|---|---|
| Thành công | `201` | `Swipe` vừa tạo |
| `gameId` sai định dạng | `400` | `{ "error": "gameId is invalid" }` |
| Body không phải object JSON | `400` | `{ "error": "Body must be a JSON object" }` |
| `direction` không thuộc `left`, `right`, `up` | `400` | `{ "error": "direction must be left, right or up" }` |
| `profileId` thiếu hoặc sai định dạng | `400` | `{ "error": "profileId is invalid" }` |
| Không có game | `404` | `{ "error": "Game not found" }` |
| Không có profile | `404` | `{ "error": "Profile not found" }` |
| Hồ sơ đã quẹt trong ván này | `409` | `{ "error": "Profile already swiped in this game" }` |

Thứ tự kiểm: `gameId` → body (`direction` trước `profileId`) → game tồn tại → profile tồn tại → trùng.

### 3.5 DELETE /api/games/:gameId/swipes/last

Hoàn tác (LIFO): xoá lượt quẹt mới nhất của ván.

| Trường hợp | Mã | Body |
|---|---|---|
| Thành công | `200` | `Swipe` vừa xoá |
| `gameId` sai định dạng | `400` | `{ "error": "gameId is invalid" }` |
| Không có game | `404` | `{ "error": "Game not found" }` |
| Ván chưa có lượt nào | `404` | `{ "error": "No swipe to undo" }` |

### 3.6 Lỗi chung

| Trường hợp | Mã | Body |
|---|---|---|
| JSON hỏng | `400` | `{ "error": "Invalid JSON" }` |
| Body quá 10 kB | `413` | `{ "error": "Payload too large" }` |
| Route không tồn tại | `404` | `{ "error": "Not found" }` |
| Lỗi không lường trước | `500` | `{ "error": "Internal server error" }` |

## 4. Điểm (chỉ client, không lưu)

`SCORE = { right: 10, left: -5, up: 20 }`. Điểm của ván = tổng `SCORE[direction]` trên `swipes`; server không tính, không lưu.
