# API Contract — Forum Messages (Exercise Lab 04)

Hợp đồng giữa `Exercise_Lab04/client` và `Exercise_Lab04/server`. Viết trước khi code (contract-first). Mọi thay đổi phải sửa file này trước, rồi mới sửa client và server.

## 1. Quy ước chung

| Mục | Giá trị |
|---|---|
| Base URL (dev) | `http://localhost:3001` (client đọc từ `VITE_API_BASE`) |
| Định dạng | JSON, `Content-Type: application/json` |
| CORS | Chỉ cho origin `CLIENT_ORIGIN` (mặc định `http://localhost:5173`) |
| Kênh hợp lệ | `nasa`, `esports-tribunal`, `notNasa` |
| Lưu trữ | Trong bộ nhớ, mất khi khởi động lại server |

## 2. Kiểu dữ liệu

```js
/**
 * @typedef {Object} Message
 * @property {string} id         UUID do server sinh bằng crypto.randomUUID()
 * @property {string} author     1 đến 40 ký tự sau trim
 * @property {string} text       1 đến 500 ký tự sau trim
 * @property {string} timestamp  ISO 8601, do server sinh
 */

/** @typedef {{ error: string }} ErrorBody */
```

## 3. Route

### 3.1 GET /api/channels/:channel/messages

Lấy tin nhắn của một kênh.

| Trường hợp | Mã | Body |
|---|---|---|
| Thành công | `200` | `Message[]`, sắp xếp tăng dần theo `timestamp` |
| Kênh không thuộc danh sách | `404` | `{ "error": "Unknown channel" }` |

### 3.2 POST /api/channels/:channel/messages

Gửi tin nhắn mới. Body yêu cầu:

```json
{ "author": "Hung", "text": "Hello" }
```

Client **không** gửi `id` và `timestamp`; nếu có thì server bỏ qua.

| Trường hợp | Mã | Body |
|---|---|---|
| Thành công | `201` | `Message` vừa tạo |
| Thiếu `author` hoặc `text`, không phải chuỗi, rỗng sau `trim` | `400` | `{ "error": "..." }` |
| `author` dài hơn 40 hoặc `text` dài hơn 500 ký tự | `400` | `{ "error": "..." }` |
| Body không phải JSON hợp lệ | `400` | `{ "error": "Invalid JSON" }` |
| Body không phải JSON object (mảng, rỗng, không phải `application/json`) | `400` | `{ "error": "..." }` |
| Body lớn hơn 10 KB | `413` | `{ "error": "Payload too large" }` |
| Kênh không thuộc danh sách | `404` | `{ "error": "Unknown channel" }` |

Kênh được kiểm **trước** body: kênh lạ luôn là `404`, kể cả khi body sai.

### 3.3 Lỗi chung

| Trường hợp | Mã | Body |
|---|---|---|
| Đường dẫn không có trong hợp đồng | `404` | `{ "error": "Not found" }` |
| Lỗi không lường trước | `500` | `{ "error": "Internal server error" }` (không lộ chi tiết) |

## 4. Giới hạn dùng ở hai nơi

Server (kiểm tra payload) và client (`PostForm`) dùng cùng giới hạn: `author` tối đa 40, `text` tối đa 500. Hai project độc lập nên không import chéo; mỗi nơi ghi chú trỏ về file này.

## 5. Biến môi trường liên quan

| Biến | Dùng ở | Ý nghĩa |
|---|---|---|
| `PORT` | server | Cổng lắng nghe, mặc định `3001` |
| `CLIENT_ORIGIN` | server | Origin được phép CORS |
| `RESPONSE_DELAY_MS` | server | Độ trễ giả (ms) để kiểm chứng huỷ request; mặc định `0` |
| `VITE_API_BASE` | client | Base URL của server |

## 6. Ngoài phạm vi

Xác thực, phân trang, sửa và xoá tin nhắn, WebSocket. Mongoose chỉ xuất hiện ở Homework 2.
