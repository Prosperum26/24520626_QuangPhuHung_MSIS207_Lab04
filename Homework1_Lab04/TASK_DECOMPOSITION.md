# TASK_DECOMPOSITION — Homework 1: Card-Swipe Deck "Hẹn Hò Nhưng Không Yêu"

> WBS con của [TASK_DECOMPOSITION.md](../TASK_DECOMPOSITION.md). Thiết kế đã chốt: [spec](../docs/superpowers/specs/2026-11-26-hw1-swipe-deck-design.md). Luật: [project-rules.md](../project-rules.md), [Agents.md](../Agents.md).
> **Cho agent thực thi:** dùng superpowers:executing-plans hoặc superpowers:subagent-driven-development; làm đúng một task ID mỗi lượt, tick `- [ ]` chỉ khi đã chạy lệnh kiểm chứng và thấy output thật.
> Mỗi project (`server/`, `client/`) là độc lập: chạy `npm` ngay trong folder đó. Đường dẫn bên dưới tính từ `Homework1_Lab04/`.

**Mục tiêu:** app quẹt hồ sơ hẹn hò full-stack: quẹt bằng phím và pointer, hoàn tác LIFO, điểm bất đối xứng dẫn xuất, lưu ván trong MongoDB và quẹt tiếp ván dở mỗi lần mở.

**Kiến trúc:** server Express 5 + Mongoose 8 với ba model `Profile`, `Game`, `Swipe`; hoàn tác = xoá `Swipe` mới nhất. Client React 19 giữ `history` (mảng `Swipe`) trong một `useReducer`; thẻ còn lại, thẻ hiện tại, điểm đều tính trong render. Request ghi chạy tuần tự qua hàng đợi promise; lỗi thì đồng bộ lại từ server.

**Stack:** Node 22, Express ^5.1, Mongoose ^8, cors, Vitest ^5 + supertest (server); React ^19.3, Vite ^8, Vitest + jsdom + React Testing Library + user-event, ESLint 9 (client); MongoDB `mongo:8.0` qua Docker Compose.

## 1. Ràng buộc chung (mọi task đều phải theo)

- Điểm: `SCORE = { right: 10, left: -5, up: 20 }`, khai báo đúng một chỗ (`client/src/domain/swipeConfig.js`).
- Ngưỡng quẹt pointer: `SWIPE_THRESHOLD_PX = 80`.
- Cổng: server `3002`, client `5174` (`strictPort`). CORS chỉ cho `CLIENT_ORIGIN` (mặc định `http://localhost:5174`).
- Phím: `ArrowLeft` = `left` (Bỏ qua), `ArrowRight` = `right` (Thích), `ArrowUp` = `up` (Siêu thích), `Backspace` = hoàn tác.
- Nhãn hiển thị: `DIRECTION_LABEL = { left: 'Bỏ qua', right: 'Thích', up: 'Siêu thích' }`.
- Cấm (grep phải ra 0 dòng): `useNewUrlParser|useUnifiedTopology|mongodb://` trong `server/src`; `keyCode|react-router|defaultProps|dangerouslySetInnerHTML` trong `client/src`; `useEffect` trong `client/src/domain`.
- Mongoose chỉ dùng `async`/`await`, không callback. Thiếu `MONGODB_URI` thì `throw new Error('MONGODB_URI missing')`.
- Mọi `<button>` có `type`; icon trong nút luôn đi kèm chữ hiển thị. Danh sách dùng `key` là `id` thực thể.
- Commit: Conventional Commits, chỉ `git add` file của task, không push, không thêm dòng `Co-Authored-By` (người dùng tự thêm).

## 2. Điểm cần soi kỹ (spec không nói, dễ gây lỗi khi dùng thật)

| # | Tình huống | Hành vi mong đợi | Test nằm ở |
|---|---|---|---|
| R1 | Bấm hoàn tác ngay khi `POST` quẹt trước đó còn đang chờ | `DELETE last` chỉ gửi sau khi `POST` xong; DB và màn hình khớp | H1-10 |
| R2 | Giữ phím hoặc bấm liên tục khi đã hết thẻ | Không gửi request nào, không lỗi, điểm không đổi | H1-10, H1-11 |
| R3 | Id trong URL sai định dạng (`/api/games/abc/swipes`) | `400`, không phải `500` | H1-05 |
| R4 | Chạm hoặc click thẻ không kéo (dx, dy < 80) hay `pointerup` không có `pointerdown` | Không quẹt, thẻ về chỗ, không crash | H1-12 |
| R5 | Server tắt lúc đang chơi | Màn hình giữ nguyên, hiện `role="alert"`, thao tác kế tiếp chạy lại được sau khi server bật | H1-10, H1-13 |

## 3. Cấu trúc file

```text
Homework1_Lab04/
  compose.yaml                 mongo:8.0, container msis207-lab04-mongo, volume msis207-lab04-mongo-data
  .env.example                 MONGODB_URI, MONGODB_URI_TEST, PORT, CLIENT_ORIGIN, VITE_API_BASE
  README.md                    cách chạy: docker compose, seed, dev, test
  evidence/
  server/
    package.json  vitest.config.js
    src/
      db.js                    connectDb(uri), disconnectDb()
      models.js                Profile, Game, Swipe, DIRECTIONS, toDto()
      validate.js              validateSwipe(body)
      app.js                   createApp({ clientOrigin })
      server.js                đọc env, connect, listen
      seed.js                  SEED_PROFILES + seedProfiles(); chạy trực tiếp = nạp lại
      test/db.js               useTestDb(): connect DB test, dọn dữ liệu mỗi test
      *.test.js                cạnh file nguồn
  client/
    package.json  vite.config.js  eslint.config.js  index.html
    public/avatars/male.svg  female.svg
    src/
      main.jsx  App.jsx  App.module.css
      styles/tokens.css
      domain/swipeConfig.js    SCORE, DIRECTIONS, DIRECTION_LABEL, KEY_TO_DIRECTION, SWIPE_THRESHOLD_PX
      domain/deck.js           deriveDeck, scoreOf, tally
      api/swipeApi.js          ApiError + 5 hàm gọi API
      hooks/useSwipeGame.js    state, hàng đợi ghi, đồng bộ lại
      hooks/useSwipeKeyboard.js
      components/SwipeCard.jsx (+ .module.css)   thẻ + pointer
      components/SwipeControls.jsx (+ .module.css)
      components/GameSummary.jsx (+ .module.css)
      test/setup.js  test/fakeSwipeServer.js
```

## 4. Bảng task

| ID | Task | Gate | Trạng thái |
|---|---|---|---|
| H1-00 | Hạ tầng: compose, env, sắp lại thứ tự Homework | `docker compose up -d` + ping Mongo | [x] |
| H1-01 | API contract | File contract được commit trước code | [x] |
| H1-02 | Server: khung, kết nối DB, model | Test model xanh | [x] |
| H1-03 | `GET /api/profiles` + seed | Test route + `npm run seed` | [x] |
| H1-04 | Route ván: `GET /api/games/current`, `POST /api/games` | Test route xanh | [ ] |
| H1-05 | Route quẹt: `POST` và `DELETE .../last` | Test 201/400/404/409 xanh | [ ] |
| H1-06 | `server.js` chạy thật | `curl` trên server thật | [ ] |
| H1-07 | Client: khung project, token, avatar | `npm test`, `lint`, `build` chạy | [ ] |
| H1-08 | Domain: cấu hình + dẫn xuất | Test thuần xanh | [ ] |
| H1-09 | Lớp gọi API | Test với fetch giả xanh | [ ] |
| H1-10 | Hook `useSwipeGame` | Test R1, R2, R5 xanh | [ ] |
| H1-11 | Hook `useSwipeKeyboard` | Test phím xanh | [ ] |
| H1-12 | `SwipeCard` với pointer | Test R4 xanh | [ ] |
| H1-13 | Ghép màn hình: nút, status, tổng kết, Ván mới | Test tích hợp xanh | [ ] |
| H1-14 | CSS, responsive, kiểm chứng thủ công, tài liệu | Bằng chứng trong `evidence/` | [ ] |

---

## 5. Chi tiết task

### H1-00: Hạ tầng

**Files:** tạo `compose.yaml`, `.env.example`; sửa `../.env.example` (ghi chú biến của HW1 nằm ở `Homework1_Lab04/.env.example`). Thứ tự Homework trong `../TASK_DECOMPOSITION.md`, `../project-rules.md`, `../Agents.md` đã sửa cùng commit plan.

- [ ] **Bước 1:** `compose.yaml` một service `mongo`: `image: mongo:8.0`, `container_name: msis207-lab04-mongo`, `ports: ["27017:27017"]`, volume có tên `msis207-lab04-mongo-data:/data/db`, `restart: unless-stopped`, healthcheck `mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok"`.
- [ ] **Bước 2:** `.env.example` (giá trị mẫu cho localhost, không có bí mật):

```bash
MONGODB_URI=mongodb://localhost:27017/swipe_deck
MONGODB_URI_TEST=mongodb://localhost:27017/swipe_deck_test
PORT=3002
CLIENT_ORIGIN=http://localhost:5174
VITE_API_BASE=http://localhost:3002
```

  Copy thành `.env` (đã nằm trong `.gitignore`).
- [ ] **Bước 3:** thay container tạo tay bằng compose: `docker rm -f msis207-lab04-mongo` rồi `docker compose up -d` (volume cũ giữ nguyên).
- [ ] **Bước 4:** kiểm: `docker exec msis207-lab04-mongo mongosh --quiet --eval "db.runCommand({ping:1}).ok"` → `1`; `docker compose ps` → `healthy`.
- [ ] **Bước 5:** commit `chore(hw1): add mongo compose and env template` (cùng phần sửa tài liệu gốc).

### H1-01: API contract

**Files:** tạo `../shared/swipe-api-contract.md` theo đúng bảng route ở spec §5.2, thêm typedef:

```js
/** @typedef {{ id: string, name: string, age: number, gender: 'male'|'female', bio: string }} Profile */
/** @typedef {{ id: string, createdAt: string }} Game */
/** @typedef {{ id: string, gameId: string, profileId: string, direction: 'left'|'right'|'up', createdAt: string }} Swipe */
/** @typedef {{ game: Game, swipes: Swipe[] }} GameState */
```

Thông báo lỗi chốt nguyên văn: `'Invalid JSON'`, `'Body must be a JSON object'`, `'direction must be left, right or up'`, `'profileId is invalid'`, `'gameId is invalid'`, `'Game not found'`, `'Profile not found'`, `'Profile already swiped in this game'`, `'No swipe to undo'`, `'Not found'`.

- [ ] **Bước 1:** viết file. **Bước 2:** commit `docs(hw1): add swipe deck api contract`.

### H1-02: Server: khung, kết nối DB, model

**Files:** tạo `server/package.json`, `server/vitest.config.js`, `server/src/db.js`, `server/src/models.js`, `server/src/test/db.js`, `server/src/models.test.js`.

**Interfaces:**
- Produces: `connectDb(uri: string | undefined): Promise<void>` (throw `'MONGODB_URI missing'` khi rỗng); `disconnectDb(): Promise<void>`; model `Profile`, `Game`, `Swipe`; `DIRECTIONS = ['left','right','up']`; `toDto(doc) → object` (đổi `_id` thành `id` chuỗi, đổi `gameId`/`profileId` ObjectId thành chuỗi, bỏ `__v`, `updatedAt`); `useTestDb()` đăng ký `beforeAll`/`beforeEach`/`afterAll`.

- [ ] **Bước 1:** `package.json` (`"type": "module"`), scripts: `dev` = `node --watch --env-file-if-exists=../.env src/server.js`, `start` tương tự không `--watch`, `seed` = `node --env-file-if-exists=../.env src/seed.js`, `test` = `vitest run`. Cài `express@^5.1 mongoose@^8 cors`, dev `vitest@^5 supertest`.
- [ ] **Bước 2:** `vitest.config.js`: `test.env = loadEnv('test', '..', '')` (đọc `../.env` cả biến không có tiền tố `VITE_`), `fileParallelism: false` (dùng chung một DB test).
- [ ] **Bước 3:** `useTestDb()`: `beforeAll` gọi `connectDb(process.env.MONGODB_URI_TEST)` rồi `Promise.all([Profile, Game, Swipe].map((m) => m.syncIndexes()))`; `beforeEach` `deleteMany({})` cả ba; `afterAll` `disconnectDb()`.
- [ ] **Bước 4:** viết test đỏ `models.test.js`:

```js
it('connectDb ném lỗi khi thiếu uri', async () => {
  await expect(connectDb(undefined)).rejects.toThrow('MONGODB_URI missing');
});
it('Profile từ chối gender lạ và tuổi < 18', async () => {
  await expect(Profile.create({ name: 'A', age: 17, gender: 'male', bio: '' })).rejects.toThrow();
  await expect(Profile.create({ name: 'A', age: 20, gender: 'x', bio: '' })).rejects.toThrow();
});
it('Swipe không cho quẹt trùng hồ sơ trong một ván', async () => {
  // tạo game + profile, Swipe.create hai lần cùng cặp → lần hai rejects với code 11000
});
it('toDto trả id chuỗi, không có _id và __v', async () => { /* ... */ });
```

- [ ] **Bước 5:** chạy `npm test` → FAIL (chưa có module).
- [ ] **Bước 6:** viết `db.js` (`await mongoose.connect(uri)`, không cờ phụ) và `models.js` theo schema ở spec §5.1: `Profile` (`name` bắt buộc, trim, max 40; `age` min 18 max 99; `gender` enum; `bio` max 140), `Game` `{ timestamps: true }`, `Swipe` `{ timestamps: { createdAt: true, updatedAt: false } }`, `direction` enum `DIRECTIONS`, index unique `{ gameId: 1, profileId: 1 }`.
- [ ] **Bước 7:** `npm test` → PASS (Mongo Docker phải đang chạy).
- [ ] **Bước 8:** commit `feat(hw1-server): mongoose 8 models and connection`.

### H1-03: `GET /api/profiles` + seed

**Files:** tạo `server/src/app.js`, `server/src/seed.js`, `server/src/app.profiles.test.js`, `server/src/seed.test.js`.

**Interfaces:**
- Produces: `createApp({ clientOrigin = 'http://localhost:5174' } = {}) → express.Application`; `SEED_PROFILES` (12 phần tử: 6 `male`, 6 `female`); `seedProfiles(): Promise<number>` (xoá rồi `insertMany`, trả số hồ sơ).

- [ ] **Bước 1:** test đỏ:
  - `GET /api/profiles` trên DB rỗng → `200 []`.
  - sau `seedProfiles()` → `200`, độ dài 12, phần tử có đúng khoá `id, name, age, gender, bio`, thứ tự trùng `SEED_PROFILES`.
  - `seedProfiles()` chạy hai lần vẫn còn 12.
  - route lạ → `404 { error: 'Not found' }`; body JSON hỏng ở POST bất kỳ → `400 { error: 'Invalid JSON' }`.
- [ ] **Bước 2:** `npm test` → FAIL.
- [ ] **Bước 3:** `createApp`: `cors({ origin: clientOrigin })`, `express.json({ limit: '10kb' })`, route `GET /api/profiles` = `Profile.find().sort({ _id: 1 }).lean()` rồi `map(toDto)`; middleware 404; middleware lỗi bốn tham số ánh xạ: `entity.parse.failed` → 400 `'Invalid JSON'`, `CastError` → 400, `ValidationError` → 400, `err.code === 11000` → 409, còn lại 500 `'Internal server error'` (có `console.error`). Express 5 tự chuyển lỗi của handler `async` vào middleware này.
- [ ] **Bước 4:** `seed.js`: export `SEED_PROFILES`, `seedProfiles`; khi chạy trực tiếp (`import.meta.url === pathToFileURL(process.argv[1]).href`) thì connect `MONGODB_URI`, seed, in số lượng, disconnect. Nội dung 12 hồ sơ tiếng Việt, hư cấu, `bio` ≤ 140 ký tự.
- [ ] **Bước 5:** `npm test` → PASS. **Bước 6:** commit `feat(hw1-server): profiles endpoint and seed script`.

### H1-04: Route ván

**Files:** sửa `server/src/app.js`; tạo `server/src/app.games.test.js`.

- [ ] **Bước 1:** test đỏ:
  - `GET /api/games/current` khi chưa có game → `200`, `swipes: []`, và đúng 1 `Game` trong DB; gọi lại lần hai trả **cùng** `game.id`.
  - `POST /api/games` → `201 { game, swipes: [] }`; sau đó `GET /api/games/current` trả game mới này.
  - game cũ có 2 swipe → `GET current` trả `swipes` theo thứ tự tạo (cũ trước).
- [ ] **Bước 2:** FAIL. **Bước 3:** cài đặt. Ván dở = `Game.findOne().sort({ createdAt: -1, _id: -1 }).lean()`; không có thì `Game.create({})`. Swipe của ván: `Swipe.find({ gameId }).sort({ createdAt: 1, _id: 1 }).lean()`.
- [ ] **Bước 4:** PASS. **Bước 5:** commit `feat(hw1-server): current game and new game endpoints`.

### H1-05: Route quẹt

**Files:** tạo `server/src/validate.js`, `server/src/validate.test.js`, `server/src/app.swipes.test.js`; sửa `server/src/app.js`.

**Interfaces:** `validateSwipe(body: unknown) → { value: { profileId: string, direction: 'left'|'right'|'up' } } | { error: string }` (bỏ qua khoá thừa; dùng `mongoose.isValidObjectId`).

- [ ] **Bước 1:** test đỏ `validate.test.js` dạng bảng: `null`, mảng, thiếu `direction`, `direction: 'down'`, `profileId: 'abc'`, hợp lệ có khoá thừa → chỉ trả `profileId`, `direction`.
- [ ] **Bước 2:** test đỏ `app.swipes.test.js`:
  - `POST /api/games/:id/swipes` hợp lệ → `201`, body là `Swipe` với `gameId`, `profileId` chuỗi.
  - body sai → `400` với thông báo của `validateSwipe`; `:gameId` là `'abc'` → `400 'gameId is invalid'` (R3).
  - game không tồn tại → `404 'Game not found'`; profile không tồn tại → `404 'Profile not found'`.
  - quẹt trùng → `409 'Profile already swiped in this game'`.
  - `DELETE /api/games/:id/swipes/last` sau 2 lượt → `200` trả lượt **thứ hai**; gọi tiếp → trả lượt thứ nhất; gọi tiếp → `404 'No swipe to undo'`. `:gameId` sai → `400`, game không có → `404`.
- [ ] **Bước 3:** FAIL. **Bước 4:** cài đặt: kiểm `isValidObjectId(gameId)` trước; `Game.exists`, `Profile.exists`; `Swipe.create(value + gameId)`; lỗi 11000 → 409 với thông báo trên (bắt tại handler để có thông báo riêng). Hoàn tác: `Swipe.findOneAndDelete({ gameId }, { sort: { createdAt: -1, _id: -1 } })`.
- [ ] **Bước 5:** PASS. **Bước 6:** commit `feat(hw1-server): swipe and undo-last endpoints`.

### H1-06: `server.js` chạy thật

**Files:** tạo `server/src/server.js`.

- [ ] **Bước 1:** đọc `PORT` (mặc định 3002, cách `readInt` của Exercise), `CLIENT_ORIGIN`; `await connectDb(process.env.MONGODB_URI)`; `createApp(...).listen(...)`, log URL.
- [ ] **Bước 2:** kiểm thật: `npm run seed` → in `12`; `npm run dev`; `curl http://localhost:3002/api/profiles` → 12 hồ sơ; `curl http://localhost:3002/api/games/current` → `{ game, swipes: [] }`; xoá `MONGODB_URI` khỏi `.env` tạm thời → server dừng với `MONGODB_URI missing`.
- [ ] **Bước 3:** grep cấm (mục 1) trong `server/src` → 0 dòng. **Bước 4:** commit `feat(hw1-server): bootstrap server with env guard`.

### H1-07: Client: khung project

**Files:** tạo `client/package.json`, `vite.config.js`, `eslint.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx` (tạm: `<main><h1>Hẹn Hò Nhưng Không Yêu</h1></main>`), `src/App.test.jsx`, `src/styles/tokens.css`, `src/test/setup.js`, `public/avatars/male.svg`, `public/avatars/female.svg`.

- [ ] **Bước 1:** sao chép cấu hình từ `../Exercise_Lab04/client` (đổi `name` thành `msis207-lab04-hw1-client`, **bỏ** `react-router`). `vite.config.js` thêm `server: { port: 5174, strictPort: true }`, `envDir: '..'`. `index.html` `lang="vi"`, `<title>Hẹn Hò Nhưng Không Yêu</title>`. `main.jsx` như Exercise nhưng không có `BrowserRouter`.
- [ ] **Bước 2:** `setup.js` như Exercise, thêm polyfill cho jsdom: nếu chưa có `window.PointerEvent` thì `class PointerEvent extends MouseEvent { constructor(type, init = {}) { super(type, init); this.pointerId = init.pointerId ?? 1; } }`; stub `Element.prototype.setPointerCapture`/`releasePointerCapture`/`hasPointerCapture` khi thiếu.
- [ ] **Bước 3:** `tokens.css` lấy từ Exercise, thêm `--color-like`, `--color-pass`, `--color-super` (chữ trên nền đạt 4.5:1), `--card-width: min(100%, 22rem)`, `--card-ratio: 3 / 4`.
- [ ] **Bước 4:** hai avatar SVG tự vẽ (silhouette đầu + vai, `viewBox="0 0 120 120"`, nam/nữ khác kiểu tóc và màu nền), không lấy ảnh có bản quyền.
- [ ] **Bước 5:** test smoke: render `<App />` có heading cấp 1 "Hẹn Hò Nhưng Không Yêu". `npm test`, `npm run lint`, `npm run build` đều xanh.
- [ ] **Bước 6:** commit `chore(hw1-client): init vite react project`.

### H1-08: Domain

**Files:** tạo `client/src/domain/swipeConfig.js`, `client/src/domain/deck.js`, `client/src/domain/deck.test.js`.

**Interfaces:**
- `swipeConfig.js`: `SCORE`, `DIRECTIONS`, `DIRECTION_LABEL`, `SWIPE_THRESHOLD_PX` (giá trị ở mục 1), `KEY_TO_DIRECTION = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up' }`, `UNDO_KEY = 'Backspace'`. Tất cả `Object.freeze`.
- `deck.js`: `deriveDeck(profiles: Profile[], history: Swipe[]) → Profile[]`; `scoreOf(history) → number`; `tally(history) → { left: number, right: number, up: number }`. Hàm thuần.

- [ ] **Bước 1:** test đỏ:

```js
const P = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
const s = (profileId, direction) => ({ id: profileId + direction, profileId, direction });
expect(deriveDeck(P, [s('b', 'left')]).map((p) => p.id)).toEqual(['a', 'c']);
expect(scoreOf([s('a', 'right'), s('b', 'left'), s('c', 'up')])).toBe(25);
expect(scoreOf([])).toBe(0);
expect(scoreOf([s('a', 'left'), s('b', 'left')])).toBe(-10);
expect(tally([s('a', 'right'), s('b', 'up'), s('c', 'right')])).toEqual({ left: 0, right: 2, up: 1 });
// history Object.freeze vẫn chạy (không mutate)
```

- [ ] **Bước 2:** FAIL → cài đặt (`Set` id đã quẹt; `reduce` với `SCORE`) → PASS.
- [ ] **Bước 3:** commit `feat(hw1-client): derived deck and asymmetric score`.

### H1-09: Lớp gọi API

**Files:** tạo `client/src/api/swipeApi.js`, `client/src/api/swipeApi.test.js`, `client/src/test/fakeSwipeServer.js`.

**Interfaces:**
- `class ApiError extends Error { status: number }`.
- `fetchProfiles({ signal }) → Promise<Profile[]>`; `fetchCurrentGame({ signal } = {}) → Promise<GameState>`; `createGame() → Promise<GameState>`; `postSwipe(gameId, { profileId, direction }) → Promise<Swipe>`; `deleteLastSwipe(gameId) → Promise<Swipe>`.
- Base URL: `import.meta.env.VITE_API_BASE ?? 'http://localhost:3002'`.
- `installFakeSwipeServer({ profiles })` → `{ fetchMock, db: { games, swipes }, state: { fail, hold }, release() }`, cùng kiểu với `../Exercise_Lab04/client/src/test/fakeForumServer.js`, cài đặt đúng bảng route của contract (kể cả 404/409).

- [ ] **Bước 1:** test đỏ: mỗi hàm gọi đúng method + URL + body JSON + header `Content-Type`; `res.ok === false` → ném `ApiError` có `status` và `message` lấy từ `{ error }`; lỗi mạng → ném lại nguyên lỗi; `signal` được chuyển cho `fetch`.
- [ ] **Bước 2:** FAIL → cài đặt một hàm nội bộ `request(path, init)` → PASS.
- [ ] **Bước 3:** commit `feat(hw1-client): swipe api client`.

### H1-10: Hook `useSwipeGame`

**Files:** tạo `client/src/hooks/useSwipeGame.js`, `client/src/hooks/useSwipeGame.test.jsx`.

**Interfaces:**

```js
/** @returns {{
 *   status: 'loading'|'ready'|'error', error: string|null,
 *   profiles: Profile[], history: Swipe[], deck: Profile[], current: Profile|undefined,
 *   score: number, lastEvent: { type: 'swipe'|'undo'|'new', profileId?: string, direction?: string } | null,
 *   swipe: (direction: 'left'|'right'|'up') => void, undo: () => void, newGame: () => void, retry: () => void,
 * }} */
export function useSwipeGame()
```

Quyết định cài đặt:
- Một `useReducer`. State: `{ status, error, profiles, gameId, history, lastEvent, loadKey }`. `deck`, `current`, `score` tính trong thân hook bằng hàm H1-08.
- Tải: `useEffect` phụ thuộc `[loadKey]`, `AbortController`, gọi song song `fetchProfiles` + `fetchCurrentGame`, dispatch `LOADED` hoặc `LOAD_FAILED` (bỏ qua `AbortError`, kiểm `signal.aborted` trước dispatch). `retry` dispatch `RETRY` (đặt `status: 'loading'`, tăng `loadKey`) từ event handler, không setState đầu effect.
- Ghi tuần tự: `queueRef = useRef(Promise.resolve())`, `epochRef = useRef(0)`. `enqueue(task)` nối task vào chuỗi; task bỏ qua nếu `epoch` đã đổi. Task lỗi: tăng `epochRef`, dispatch `MUTATION_FAILED` (đặt `error`), gọi `fetchCurrentGame()` và dispatch `SYNCED { gameId, history }`.
- `swipe(direction)`: không có `current` hoặc `status !== 'ready'` thì bỏ qua (R2). Dispatch `SWIPED` với bản ghi tạm `{ id: 'local-' + n, profileId: current.id, direction }`; reducer bỏ qua nếu `profileId` đã có trong `history`. Rồi `enqueue(() => postSwipe(gameId, ...))`.
- `undo()`: `history` rỗng thì bỏ qua; dispatch `UNDONE` (bỏ phần tử cuối); `enqueue(() => deleteLastSwipe(gameId))`.
- `newGame()`: dispatch `NEW_GAME_START` (`status: 'loading'`); `enqueue(createGame)` rồi dispatch `LOADED` với `history: []`.
- Một thao tác thành công sau đó xoá `error` (dispatch `MUTATION_OK`).

- [ ] **Bước 1:** test đỏ (dùng `renderHook` + `installFakeSwipeServer` 3 hồ sơ):
  - tải xong: `status 'ready'`, `deck.length 3`, `score 0`.
  - ván dở có sẵn 1 lượt `right` trên fake server → sau tải `history.length 1`, `score 10`, `deck.length 2` (quẹt tiếp ván dở).
  - `swipe('right')`, `swipe('left')`, `undo()`, `undo()` → `history` rỗng, `score 0`, và `fetchMock` nhận đúng thứ tự `POST, POST, DELETE, DELETE`; fake DB còn 0 swipe.
  - **R1:** `state.hold = true`, `swipe('right')` rồi `undo()` → trước `release()` chỉ có 1 request ghi đã gửi; sau `release()` (lặp tới khi hết) DB 0 swipe.
  - **R2:** quẹt hết 3 thẻ rồi gọi `swipe('right')` 5 lần → không thêm request, `score` không đổi.
  - **R5:** `state.fail = 'network'` rồi `swipe('up')` → `error` khác null; `state.fail = null`; màn hình (`history`) khớp `db.swipes` sau đồng bộ; `swipe('left')` tiếp theo thành công và `error` về null.
  - `newGame()` → `history []`, `gameId` mới, DB có 2 game.
  - unmount khi đang tải → không có cảnh báo `act`/setState sau unmount.
- [ ] **Bước 2:** FAIL → cài đặt → PASS. `grep -c useEffect src/hooks/useSwipeGame.js` = 1.
- [ ] **Bước 3:** commit `feat(hw1-client): swipe game hook with lifo undo and serialized writes`.

### H1-11: Hook `useSwipeKeyboard`

**Files:** tạo `client/src/hooks/useSwipeKeyboard.js`, `client/src/hooks/useSwipeKeyboard.test.jsx`.

**Interfaces:** `useSwipeKeyboard({ onSwipe: (d) => void, onUndo: () => void, enabled = true })`.

- [ ] **Bước 1:** test đỏ (user-event và `fireEvent.keyDown(window, ...)`):
  - `ArrowLeft/Right/Up` gọi `onSwipe('left'|'right'|'up')`; `Backspace` gọi `onUndo`; sự kiện bị `preventDefault` (`defaultPrevented === true`).
  - `repeat: true` → không gọi (R2); có `ctrlKey`/`metaKey`/`altKey` → không gọi; target là `<input type="text">` → không gọi; `enabled: false` → không gọi.
  - unmount → listener được gỡ (gõ phím sau unmount không gọi).
- [ ] **Bước 2:** FAIL → cài đặt: một `useEffect` gắn `keydown` lên `window`, đọc `e.key` qua `KEY_TO_DIRECTION`/`UNDO_KEY`; bộ lọc ô nhập chữ sao chép từ `useDrumKeyboard.js` Lab 3 (`TYPING_TARGET`). Callback giữ trong ref để effect chỉ phụ thuộc `[enabled]` → PASS.
- [ ] **Bước 3:** commit `feat(hw1-client): keyboard swipe listener`.

### H1-12: `SwipeCard` với pointer

**Files:** tạo `client/src/components/SwipeCard.jsx`, `SwipeCard.module.css`, `SwipeCard.test.jsx`.

**Interfaces:** `<SwipeCard profile={Profile} onSwipe={(d) => void} />`. Render `<article aria-labelledby>`: `<img src={`/avatars/${profile.gender}.svg`} alt="">`, `<h2>{name}, {age}</h2>`, `<p>{bio}</p>`, nhãn hướng kéo (`THÍCH`, `BỎ QUA`, `SIÊU THÍCH`) hiện theo `data-drag` (chữ, không chỉ màu).

- [ ] **Bước 1:** test đỏ (`fireEvent.pointerDown/Move/Up` với `clientX/clientY`):
  - kéo `dx = +120` → `onSwipe('right')`; `dx = -120` → `'left'`; `dy = -120`, `dx = 10` → `'up'`.
  - **R4:** `dx = 40` → không gọi, `data-drag` về rỗng; `pointerUp` không có `pointerDown` → không gọi, không ném lỗi; `pointerCancel` giữa chừng → không gọi.
  - đang kéo `dx = 100` → `data-drag="right"` và chữ "THÍCH" hiển thị.
- [ ] **Bước 2:** FAIL → cài đặt: điểm đầu trong `useRef` (null khi không kéo); `pointermove` đặt `--dx`/`--dy` bằng `el.style.setProperty` qua ref, chỉ `setState` khi **hướng** đổi (`dragDirection`); quyết định ở `pointerup`: ưu tiên `dy < -80` khi `|dy| > |dx|`, ngược lại `dx > 80` / `dx < -80`. Chỉ nhận nút chính (`e.button === 0`). CSS: `touch-action: none`, `transform: translate(var(--dx), var(--dy)) rotate(calc(var(--dx) / 20))`, transition tắt dưới `prefers-reduced-motion` → PASS.
- [ ] **Bước 3:** commit `feat(hw1-client): draggable swipe card with pointer events`.

### H1-13: Ghép màn hình

**Files:** tạo `client/src/components/SwipeControls.jsx` (+ css, test), `client/src/components/GameSummary.jsx` (+ css, test); sửa `client/src/App.jsx`, `App.module.css`, `App.test.jsx`.

**Interfaces:**
- `<SwipeControls onSwipe onUndo canSwipe canUndo />`: 4 nút `type="button"` với chữ "← Bỏ qua", "↑ Siêu thích", "→ Thích", "⌫ Hoàn tác" (mũi tên bọc `aria-hidden="true"`), `aria-keyshortcuts` tương ứng (`ArrowLeft`...). Hoàn tác `disabled={!canUndo}`; ba nút quẹt `disabled={!canSwipe}`.
- `<GameSummary score tally={{left,right,up}} onNewGame />`: heading "Hết hồ sơ", `<dl>` điểm và ba con số.
- `App`: dùng `useSwipeGame` + `useSwipeKeyboard({ enabled: status === 'ready' })`. Header có `<h1>` và nút "Ván mới". `<dl>` Điểm / Còn lại `deck.length/profiles.length`. Có `current` → `SwipeCard` với `key={current.id}`; hết thẻ → `GameSummary`. `status === 'loading'` → khung giữ chỗ cùng kích thước thẻ trong `role="status"` "Đang tải..."; `status === 'error'` → `role="alert"` + nút "Thử lại". `error` khi đang chơi → `role="alert"`. `<output role="status">` đọc `lastEvent`: `Đã {nhãn thường} {tên}. Điểm {score}.`, `Đã hoàn tác. Điểm {score}.`, `Ván mới bắt đầu.`

- [ ] **Bước 1:** test đỏ tích hợp với fake server 3 hồ sơ:
  - tải xong thấy heading tên hồ sơ đầu; bấm "→ Thích" → thấy hồ sơ thứ hai, Điểm 10, status "Đã thích …".
  - phím `ArrowLeft` rồi `Backspace` → về lại hồ sơ thứ hai, Điểm 10.
  - quẹt hết → thấy "Hết hồ sơ" với số liệu đúng; bấm "Ván mới" → về hồ sơ đầu, Điểm 0.
  - render lại App (mô phỏng F5) với cùng fake DB → tiếp tục đúng hồ sơ đang dở và đúng điểm.
  - **R5:** `state.fail = 500` khi bấm Thích → thấy `role="alert"`; tắt lỗi, bấm Thích lần nữa → alert biến mất.
  - tải lần đầu lỗi → alert + "Thử lại"; bấm → tải lại thành công.
- [ ] **Bước 2:** FAIL → cài đặt → PASS. `npm run lint` xanh.
- [ ] **Bước 3:** commit `feat(hw1-client): assemble swipe deck screen`.

### H1-14: CSS, kiểm chứng thủ công, tài liệu

**Files:** CSS Modules các component; tạo `README.md`; cập nhật bảng ở mục 4 và `../TASK_DECOMPOSITION.md`; ảnh và ghi chú ở `evidence/`.

- [ ] **Bước 1:** bố cục một cột, thẻ giữa màn hình; 320px và 375px không cuộn ngang; vùng bấm ≥ 24×24px; `:focus-visible` rõ; nhãn hướng kéo và nút đạt tương phản 4.5:1.
- [ ] **Bước 2:** `README.md`: `docker compose up -d` → `cp .env.example .env` → `cd server && npm install && npm run seed && npm run dev` → `cd client && npm install && npm run dev` → `http://localhost:5174`; lệnh test.
- [ ] **Bước 3:** kiểm chứng (Claude làm được bằng lệnh, người dùng làm phần cần mắt và tay):
  - `npm test` cả hai project, `npm run lint`, `npm run build` (client): dán output thật vào mục 6.
  - grep cấm ở mục 1 → 0 dòng.
  - `docker exec msis207-lab04-mongo mongosh swipe_deck --quiet --eval "db.swipes.countDocuments()"` khớp số lượt trên màn hình sau vài lần quẹt và hoàn tác.
  - Lighthouse Accessibility (lưu `evidence/lighthouse-hw1.*`).
  - Chỉ dùng bàn phím chơi hết một ván; DevTools device mode kéo bằng cảm ứng; Accessibility tree có tên cho mọi nút.
- [ ] **Bước 4:** commit `docs(hw1): readme, evidence and status update`.

## 6. Kết quả kiểm chứng

Điền khi làm H1-14 (output thật, không tóm tắt suông).
