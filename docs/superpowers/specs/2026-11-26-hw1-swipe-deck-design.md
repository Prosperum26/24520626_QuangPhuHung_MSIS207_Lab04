# Thiết kế Homework 1: Card-Swipe Deck "Hẹn Hò Nhưng Không Yêu"

> Ngày: 2026-11-26. Nguồn đề: slide 20 (đặc tả), slide 31 và 32 (code mẫu, chỉ tham khảo) trong [Context.md](../../Context.md). Luật chung: [project-rules.md](../../../project-rules.md).

## 1. Mục đích

Bài tập Lab 4, phần Tier 2 "Pointer/Keyboard Swipe Queue" và "Express + Mongoose 8 async/await". App quẹt hồ sơ hẹn hò kiểu Tinder, chạy full-stack: client React 19, server Express + Mongoose 8, dữ liệu trong MongoDB chạy bằng Docker.

Không có bảo vệ trực tiếp cho bài này; code mẫu trên slide chỉ để tham khảo, không phải chép theo.

## 2. Mục tiêu, ngoài phạm vi, điều cấm

**Mục tiêu (bốn ý của slide 20):**

1. Quẹt bằng bàn phím và bằng pointer (chuột, cảm ứng, bút), dùng được trên mọi thiết bị.
2. Hoàn tác kiểu LIFO: thẻ quẹt sau cùng được lấy lại trước.
3. Điểm bất đối xứng tính hoàn toàn bằng state dẫn xuất.
4. Lưu trữ thật qua Express + Mongoose 8 (async/await).

**Thêm theo yêu cầu người dùng:** mở app hay F5 đều quẹt tiếp ván đang dở; nút "Ván mới" để chơi lại.

**Ngoài phạm vi:** đăng nhập và nhiều người chơi, match hai chiều, chat, upload ảnh, React Router (bài chỉ có một màn hình), giới hạn số lần siêu thích, thống kê nhiều ván.

**Điều cấm (thất bại dù app vẫn chạy):**

- Điểm hoặc danh sách thẻ còn lại nằm trong state riêng hay được tính bằng `useEffect`.
- Bất kỳ API nào trong [project-rules.md §4](../../../project-rules.md): callback Mongoose, `useNewUrlParser`, chuỗi kết nối cứng, `keyCode`, icon button thiếu `aria-label`...
- Chỉ quẹt được bằng kéo thả (vi phạm WCAG 2.1.1 và 2.5.7). Mọi thao tác phải có nút bấm và phím tương đương.
- Dữ liệu trên màn hình lệch với DB mà không báo cho người dùng.

## 3. Các cách đã cân nhắc

| Cách | Mô tả | Đánh đổi |
|---|---|---|
| **1. Mỗi lượt quẹt một bản ghi, hoàn tác = xoá bản ghi cuối (đã chọn)** | `Profile`, `Game`, `Swipe`. Client dẫn xuất thẻ còn lại, điểm, ngăn hoàn tác từ danh sách `Swipe` của ván | Đơn giản, khớp `Swipe.create` trên slide, DB luôn khớp màn hình. Không giữ lại dấu vết các lượt đã hoàn tác |
| 2. Nhật ký chỉ ghi thêm, hoàn tác là một bản ghi `UNDO` | Trạng thái = phát lại toàn bộ nhật ký | Có dấu vết đầy đủ, nhưng logic phát lại (hoàn tác chồng hoàn tác) phức tạp mà bài không cần |
| 3. Lịch sử nhúng trong document `Game`, gửi cả mảng mỗi lần đổi | Một model chính | Ít model nhất, nhưng request sau có thể đè request trước; mất `Swipe.create` |

Người dùng chọn cách 1.

## 4. Quyết định đã chốt với người dùng

- Ý tưởng A: thẻ là hồ sơ người (ảnh, tên, tuổi, một dòng giới thiệu).
- Ảnh demo: một avatar nam và một avatar nữ dùng chung cho mọi hồ sơ cùng giới.
- Luôn quẹt tiếp ván dở khi mở app hoặc F5; có nút "Ván mới".
- Lưu theo cách 1 ở trên.
- Code đặt ở `Homework1_Lab04/`. Thứ tự bài theo slide: HW1 Swipe Deck (slide 20), HW2 Appeal Tribunal (slide 21), HW3 Photo Gallery (slide 30).
- MongoDB chạy bằng Docker trên máy người dùng.

## 5. Kiến trúc

```text
Homework1_Lab04/
  compose.yaml            mongo:8.0, cổng 27017, volume có tên
  .env.example            MONGODB_URI, MONGODB_URI_TEST, PORT, CLIENT_ORIGIN, VITE_API_BASE
  TASK_DECOMPOSITION.md   WBS của bài
  evidence/
  server/                 Express 5 + Mongoose 8, project độc lập
  client/                 React 19 + Vite, project độc lập
```

Hai project chạy song song được với Exercise: server cổng **3002**, client cổng **5174**. Cả hai đọc `Homework1_Lab04/.env` (giống cách Exercise đọc `Exercise_Lab04/.env`).

### 5.1 Dữ liệu (Mongoose 8)

```js
// Profile: nạp sẵn bằng script seed, không có API ghi.
{ name: String (bắt buộc, <= 40), age: Number (18..99), gender: 'male'|'female', bio: String (<= 140) }

// Game: một ván. Ván dở = Game mới nhất theo createdAt.
{ createdAt, updatedAt }   // { timestamps: true }

// Swipe: một lượt quẹt.
{ gameId: ObjectId ref Game, profileId: ObjectId ref Profile, direction: 'left'|'right'|'up', createdAt }
// index unique { gameId: 1, profileId: 1 }: không quẹt một hồ sơ hai lần trong một ván.
```

Seed: 12 hồ sơ (6 nam, 6 nữ), tên và giới thiệu tiếng Việt, vui, không lấy người thật. Chạy bằng `npm run seed` (xoá mọi ván, lượt quẹt và hồ sơ rồi nạp lại; người dùng chốt 2026-11-26 để không còn swipe trỏ tới hồ sơ đã mất). Thứ tự thẻ = thứ tự `_id`.

### 5.2 API (viết vào `shared/api-contract.md` trước khi code)

Mọi response là JSON; lỗi có dạng `{ error: string }`. `_id` trả ra dưới tên `id` (chuỗi).

| Route | Thành công | Lỗi |
|---|---|---|
| `GET /api/profiles` | `200 Profile[]` theo thứ tự `_id`, đọc bằng `.lean()` | |
| `GET /api/games/current` | `200 { game, swipes }`; chưa có ván nào thì tạo mới | |
| `POST /api/games` | `201 { game, swipes: [] }` | |
| `POST /api/games/:gameId/swipes` body `{ profileId, direction }` | `201 Swipe` | `400` body sai hoặc id sai định dạng; `404` không có game hoặc profile; `409` hồ sơ đã quẹt trong ván này |
| `DELETE /api/games/:gameId/swipes/last` | `200 Swipe` vừa xoá | `404` không có game hoặc ván chưa có lượt nào |

Server giữ nguyên các luật của Exercise: `express.json()` có giới hạn, JSON hỏng trả `400`, CORS chỉ cho `CLIENT_ORIGIN`, `createApp()` tách khỏi `listen()`. Thêm: thiếu `MONGODB_URI` thì `throw` ngay khi khởi động; `await mongoose.connect(uri)` không kèm cờ cũ; mọi handler là `async` có `try/catch` hoặc đẩy lỗi về middleware lỗi.

### 5.3 Client

**State duy nhất** (một `useReducer`): `{ status: 'loading'|'ready'|'error', profiles, gameId, history, error }`. `history` là mảng `Swipe` theo thứ tự quẹt, đóng vai **ngăn xếp hoàn tác**.

**Dẫn xuất trong render (không `useEffect`, không state riêng):**

```js
const SCORE = { right: 10, left: -5, up: 20 };                 // một chỗ duy nhất
const swipedIds = new Set(history.map((s) => s.profileId));
const deck = profiles.filter((p) => !swipedIds.has(p.id));      // thẻ còn lại
const current = deck[0];
const score = history.reduce((sum, s) => sum + SCORE[s.direction], 0);
const canUndo = history.length > 0;
```

**Thao tác (cập nhật lạc quan, gửi request tuần tự):**

- Quẹt: thêm ngay vào `history` rồi `POST`. Hoàn tác: bỏ phần tử cuối rồi `DELETE .../last`. Ván mới: `POST /api/games`, thay `gameId`, xoá `history`.
- Các request ghi chạy **lần lượt** qua một hàng đợi promise trong hook, nên `DELETE last` luôn đến sau `POST` tương ứng dù người dùng bấm nhanh.
- Request nào lỗi thì bỏ các request đang chờ, tải lại `GET /api/games/current` để màn hình khớp DB, và hiện thông báo trong `role="alert"`.
- Tải lần đầu dùng `AbortController` như Exercise (kiểm `res.ok`, bỏ qua `AbortError`).

**Nhập liệu:**

- Bàn phím trên `window`: `ArrowLeft` bỏ qua, `ArrowRight` thích, `ArrowUp` siêu thích, `Backspace` hoàn tác. Đọc `e.key`; bỏ qua `e.repeat`, phím có Ctrl/Meta/Alt, và khi focus ở ô nhập chữ (dùng lại bộ lọc của `useDrumKeyboard` Lab 3). `preventDefault` để mũi tên không cuộn trang.
- Pointer trên thẻ: `pointerdown` ghi điểm đầu và `setPointerCapture`; `pointermove` cập nhật vị trí qua CSS custom property bằng ref (không `setState` mỗi lần di chuyển); `pointerup` quyết định: `dx > 80` thích, `dx < -80` bỏ qua, `dy < -80` siêu thích, còn lại thả thẻ về chỗ; `pointercancel` cũng thả về. Không có điểm đầu thì bỏ qua (sửa lỗi `startPos` null của slide). `touch-action: none` trên thẻ.
- Bốn nút có chữ hiển thị và `type="button"`: Bỏ qua, Siêu thích, Thích, Hoàn tác (tắt khi không có gì để hoàn tác). Nút "Ván mới" luôn có.

**Giao diện:**

```text
┌──────────────────────────────────────┐
│ Hẹn Hò Nhưng Không Yêu      [Ván mới] │
│ Điểm: 35        Còn lại: 7/12         │
│ ┌──────────────────────────────────┐ │
│ │        [avatar]                  │ │
│ │  Linh, 21                        │ │
│ │  "Thích cà phê, ghét nhắn trước" │ │
│ └──────────────────────────────────┘ │
│ [← Bỏ qua] [↑ Siêu thích] [→ Thích]  │
│ [⌫ Hoàn tác]                          │
│ (status) Đã thích Linh. Điểm 35.      │
└──────────────────────────────────────┘
```

- Hết thẻ: thay thẻ bằng bảng tổng kết (điểm, số thích, bỏ qua, siêu thích); vẫn hoàn tác được; có nút "Ván mới".
- Thẻ là `<article>` có heading; hướng quẹt khi kéo hiện bằng nhãn chữ ("THÍCH", "BỎ QUA"), không chỉ bằng màu.
- `<output role="status">` báo kết quả mỗi thao tác. Đang tải: `role="status"` với khung giữ chỗ cùng kích thước thẻ.
- CSS Modules + token ở `:root`; 320px không cuộn ngang; `:focus-visible` rõ; `prefers-reduced-motion` tắt animation bay thẻ.
- Avatar: `public/avatars/male.svg` và `female.svg`, tự vẽ dạng silhouette đơn giản (không lo bản quyền), `alt` rỗng vì tên đã có trong heading thẻ.

## 6. Kiểm chứng

- **Server:** Vitest + supertest chạy trên MongoDB Docker, DB riêng `swipe_deck_test` (`MONGODB_URI_TEST`), xoá dữ liệu trước mỗi test. Phủ mọi dòng của bảng API, kể cả `409` và `404`.
- **Client:** Vitest + jsdom + React Testing Library với server giả thay `fetch` (theo mẫu `fakeForumServer.js`). Phủ: dẫn xuất điểm và thẻ còn lại, LIFO hoàn tác nhiều lần, phím và `e.repeat`, kéo vượt và không vượt ngưỡng, request tuần tự, lỗi thì đồng bộ lại và hiện `alert`, quẹt tiếp ván dở khi tải lại.
- **Lệnh grep (phải ra 0 dòng):** `useNewUrlParser|useUnifiedTopology|mongodb://` trong mã server; `keyCode|react-router-dom|defaultProps` trong client; `useEffect` trong file dẫn xuất điểm.
- **Thủ công, lưu ở `evidence/`:** Lighthouse Accessibility, Accessibility tree, thử chỉ dùng bàn phím, thử cảm ứng ở DevTools device mode, dữ liệu trong `mongosh` khớp màn hình.

## 7. Để lại cho người làm

- Nội dung 12 hồ sơ seed, nét vẽ avatar SVG, bảng màu (theo token sẵn có của Exercise).
- Tên file component cụ thể, miễn tách: domain thuần (`score.js`), hook dữ liệu (`useSwipeGame.js`), hook bàn phím, component thẻ có pointer.
- Chia task và commit trong `Homework1_Lab04/TASK_DECOMPOSITION.md`.

## 8. Quyết định do Claude tự chốt (người dùng kiểm khi đọc)

1. Điểm: thích +10, bỏ qua −5, siêu thích +20.
2. Ngưỡng quẹt pointer 80px.
3. Cổng 3002 và 5174 để chạy song song Exercise.
4. Ván cũ vẫn giữ trong DB khi bấm "Ván mới"; không hỏi xác nhận vì không mất gì.
5. Quẹt vào ván không còn là ván mới nhất (hai tab) vẫn được chấp nhận; tab đó tự đồng bộ ở lần tải sau.
6. Test server dùng Mongo Docker thật thay vì `mongodb-memory-server` (đúng yêu cầu dùng Docker, không tải thêm binary).
7. Container `msis207-lab04-mongo` tạo tay hôm nay sẽ được thay bằng `compose.yaml` (cùng tên container và volume) để clone sạch cũng dựng lại được bằng `docker compose up -d`.
8. Không dùng React Router: bài một màn hình, thêm router chỉ là thứ thừa.
