# TASK_DECOMPOSITION: Homework 2, Esports Fair-Play Appeal Tribunal

> WBS con của [TASK_DECOMPOSITION.md](../TASK_DECOMPOSITION.md). Luật: [project-rules.md](../project-rules.md), [Agents.md](../Agents.md). Đề: slide 21 và slide 33 trong [Context.md](../docs/Context.md).
> **Cho agent thực thi:** dùng superpowers:executing-plans hoặc superpowers:subagent-driven-development. Mỗi lượt làm đúng một task ID. Chỉ tick `- [ ]` khi đã chạy lệnh kiểm chứng và thấy output thật.
> `server/` và `client/` là hai project độc lập: chạy `npm` ngay trong folder đó. Mọi đường dẫn bên dưới tính từ `Homework2_Lab04/`.

**Mục tiêu:** làm đủ 4 yêu cầu kỹ thuật của slide 21, phần còn lại làm tối giản:
1. Route động `/dossier/:playerID`.
2. Form kháng cáo dùng Context, validate real-time.
3. Hook `useAppealSlaTimer()` đếm ngược không trôi, đồng bộ theo độ lệch đồng hồ server.
4. `AI_FAILURE_AUDIT.md`.

**Kiến trúc:**
- Server Express 5 giữ dữ liệu trong bộ nhớ, không có DB. Đã chốt với người dùng ngày 2026-11-26: đây không phải dịch vụ thật, HW1 đã làm phần Mongo rồi.
- Server làm ba việc mà client không tự làm được: trả giờ server, giữ hạn SLA tuyệt đối, và nhận đơn (kiểm tra lại đúng luật của client, chặn khi quá hạn).
- Luật validation viết một lần ở `shared/appealRules.js`, dùng chung cho client và server.
- Client React 19 + React Router 7. Ma trận bất cân xứng dẫn xuất bằng `useMemo`, đúng mẫu slide 33.

**Stack:**
- Server: Node 22, Express ^5.3, cors, Vitest ^5 + supertest.
- Client: React ^19.3, react-router ^7.18, Vite ^8, Vitest + jsdom + React Testing Library + user-event, ESLint 9 (cấu hình chép từ HW1).

**Không làm:** đăng nhập, lưu bền dữ liệu (restart server thì mất đơn và hạn SLA tính lại), phía hội đồng xét đơn, Lighthouse.

## 1. Ràng buộc chung

- **Cổng:** server `3003`, client `5175` (`strictPort`). CORS chỉ cho `CLIENT_ORIGIN`, mặc định `http://localhost:5175`.
- **Hạn SLA:** `appealDeadline = serverStartedAt + SLA_HOURS * 3_600_000` (số ms epoch, tính một lần khi tạo store). `SLA_HOURS` mặc định `48`. Giá trị không phải số dương thì dùng `48`.
- **ID hồ sơ:** `'himass'`, `'tanvuu'`, chữ thường. Client gọi `playerID.toLowerCase()` trước khi fetch.
- **Nội dung:** chỉ dùng dữ kiện báo chí, có ghi nguồn. Không bịa lời phát biểu. Header ghi rõ: `Mô phỏng phục vụ bài tập MSIS207, không phải cổng chính thức của KRAFTON.`
- **Cấm** (grep phải ra 0 dòng):
  - `react-router-dom|keyCode|defaultProps|dangerouslySetInnerHTML` trong `client/src`.
  - `useEffect` trong `client/src/form` và `client/src/domain`.
  - `s - 1|remaining - ` trong `client/src/hooks/useAppealSlaTimer.js` (không được đếm lùi bằng cách trừ dần).
- **Form:** `values`, `touched`, `submitted` là state, còn `errors` và `isValid` tính trong render. Mỗi field gọi `useId()` riêng, có `<label htmlFor>`, `aria-invalid`, `aria-describedby`.
- **UI:** mọi `<button>` có `type`. Danh sách dùng `key` là id thực thể.
- **Commit:** Conventional Commits, scope `hw2`, `hw2-server` hoặc `hw2-client`. Chỉ `git add` file của task, không push, không thêm dòng `Co-Authored-By` (người dùng tự thêm).

## 2. Điểm cần soi kỹ

Những tình huống spec không nói tới nhưng dễ hỏng khi dùng thật.

| # | Tình huống | Hành vi mong đợi | Test nằm ở |
|---|---|---|---|
| R1 | Đồng hồ máy lệch 10 phút so với server | Thời gian còn lại tính theo giờ server, không theo giờ máy | H2-07 |
| R2 | Tab ở nền 30 giây, interval bị throttle | Khi tab hiện lại, thời gian còn lại giảm đúng 30 giây ngay lập tức | H2-07 |
| R3 | Chuyển nhanh từ `/dossier/himass` sang `/dossier/tanvuu` | Request cũ bị abort, không lúc nào hiện hồ sơ cũ dưới URL mới | H2-06 |
| R4 | Hết hạn khi form đang mở, hoặc đồng hồ máy sai khiến client tưởng còn hạn | Client khóa nút nộp. Nếu vẫn gửi được thì server trả `409` và client hiện alert | H2-03, H2-08 |
| R5 | Bấm Nộp hai lần liền, hoặc F5 sau khi đã nộp | Chỉ có một `POST`. Sau F5 hiện biên nhận đơn, không hiện lại form | H2-03, H2-08 |
| R6 | Bản giải trình toàn khoảng trắng, hoặc server nhận kiểu sai (`grounds: "x"`) | Báo lỗi field. Server trả `400`, không trả `500` | H2-01, H2-03 |

## 3. Cấu trúc file

```text
Homework2_Lab04/
  .env.example                PORT, CLIENT_ORIGIN, SLA_HOURS, VITE_API_BASE
  README.md
  evidence/
  shared/appealRules.js       GROUNDS, INITIAL_VALUES, RULES, evaluateErrors, toAppeal (dùng chung client và server)
  server/
    package.json  vitest.config.js
    src/
      dossiers.js             SEED_DOSSIERS (dữ kiện báo chí + nguồn)
      store.js                createStore({ now, slaHours })
      app.js                  createApp({ store, now, clientOrigin })
      server.js
      *.test.js               (appealRules.test.js test file trong ../shared)
  client/
    package.json  vite.config.js  eslint.config.js  index.html
    src/
      main.jsx  App.jsx  App.module.css  styles/tokens.css
      api/appealApi.js        ApiError + 4 hàm
      domain/matrix.js        computeMatrix
      domain/clock.js         estimateOffset, formatRemaining
      hooks/useDossier.js
      hooks/useAppealSlaTimer.js
      form/AppealFormContext.js  AppealFormProvider.jsx  fields.jsx  AppealForm.jsx
      components/Layout.jsx  SlaCountdown.jsx  DisproportionalityMatrix.jsx  AppealReceipt.jsx
      pages/DossierList.jsx  DossierPage.jsx  NotFound.jsx
      test/setup.js  test/fakeAppealServer.js
```

## 4. Bảng task

| ID | Task | Gate | Trạng thái |
|---|---|---|---|
| H2-00 | Contract API + env | File contract được commit trước code | [x] |
| H2-01 | Server khung + luật dùng chung | Test luật xanh | [x] |
| H2-02 | Store + dữ liệu hồ sơ | Test store xanh | [x] |
| H2-03 | Route API + `server.js` | Test supertest xanh, `curl` trên server thật | [x] |
| H2-04 | Client khung + router | Test route và 404 xanh, `lint`, `build` chạy | [x] |
| H2-05 | Domain: ma trận + đồng hồ | Test thuần xanh | [x] |
| H2-06 | API client + `useDossier` + trang hồ sơ | Test R3 xanh | [x] |
| H2-07 | `useAppealSlaTimer` + `SlaCountdown` | Test R1, R2 xanh | [x] |
| H2-08 | Form kháng cáo | Test R4, R5, R6 phía client xanh | [x] |
| H2-09 | CSS tối giản, README, kiểm chứng thủ công | Ảnh chụp trong `evidence/` | [x] |
| H2-10 | `AI_FAILURE_AUDIT.md` (người dùng viết) | Người dùng xác nhận | [ ] |

---

## 5. Chi tiết task

### H2-00: Contract API + env

**Files:** tạo `../shared/appeal-api-contract.md` và `.env.example`.

- [ ] **Bước 1:** viết contract.

  Typedef:

```js
/** @typedef {'friendly-match'|'no-explicit-rule'|'not-notified'|'disproportionate'} Ground */
/** @typedef {{ email: string, grounds: Ground[], statement: string, evidenceUrl: string, confirm: boolean }} AppealInput */
/** @typedef {AppealInput & { id: string, playerId: string, submittedAt: number }} Appeal */
/** @typedef {{ eventTier: 'exhibition'|'official', ruleExplicit: boolean, notified: boolean, priorOffenses: number }} CaseFactors */
/** @typedef {{ issuer: string, issuedAt: string, kind: 'warning'|'match-ban'|'1-year'|'permanent', scope: string }} Sanction */
/** @typedef {{ id: string, name: string, realName: string, summary: string, accusation: string, sanction: Sanction, factors: CaseFactors, sources: {title: string, url: string}[], appealDeadline: number, appeal: Appeal|null }} Dossier */
```

  Route:

| Route | Thành công | Lỗi |
|---|---|---|
| `GET /api/time` | `200 { now: number }` | |
| `GET /api/dossiers` | `200 [{ id, name, appealDeadline, hasAppeal }]` | |
| `GET /api/dossiers/:playerId` | `200 Dossier` | `404 'Dossier not found'` |
| `POST /api/dossiers/:playerId/appeals` | `201 Appeal` | `400 'Body must be a JSON object'`, `400 { error: 'Validation failed', fields: Errors }`, `404 'Dossier not found'`, `409 'Appeal window closed'`, `409 'Appeal already submitted'` |

  Lỗi chung, chốt nguyên văn: `400 'Invalid JSON'`, `404 'Not found'`, `500 'Internal server error'`. Mọi lỗi có dạng `{ error: string }`. Riêng lỗi validation có thêm `fields`.

  Kiểm tra theo thứ tự: tìm hồ sơ (404), kiểm body (400), kiểm hạn (409 window), kiểm đã nộp (409 already). Hạn tính `now() >= appealDeadline` là hết.
- [ ] **Bước 2:** tạo `.env.example`:

```bash
PORT=3003
CLIENT_ORIGIN=http://localhost:5175
SLA_HOURS=48
VITE_API_BASE=http://localhost:3003
```

- [ ] **Bước 3:** commit `docs(hw2): add appeal api contract and env template`.

### H2-01: Server khung + luật dùng chung

**Files:** tạo `server/package.json`, `server/vitest.config.js`, `shared/appealRules.js`, `server/src/appealRules.test.js`.

**Interfaces:**
- **Produces:**
  - `GROUNDS: Readonly<Record<Ground, string>>`, với nhãn:
    - `'friendly-match'`: `'Đây là giải giao hữu, không phải giải chính thức'`
    - `'no-explicit-rule'`: `'Luật giải không cấm rõ hành vi bị cáo buộc'`
    - `'not-notified'`: `'Tuyển thủ không được thông báo về thay đổi luật'`
    - `'disproportionate'`: `'Mức án không tương xứng với hành vi'`
  - `INITIAL_VALUES = { email: '', grounds: [], statement: '', evidenceUrl: '', confirm: false }`.
  - `RULES: Record<keyof AppealInput, (value, all) => string|null>`.
  - `FIELD_ORDER = ['email','grounds','statement','evidenceUrl','confirm']`.
  - `evaluateErrors(values, rules = RULES) → Errors`.
  - `toAppeal(values) → AppealInput`: trim chuỗi, giữ thứ tự grounds.

- [ ] **Bước 1:** tạo `package.json` (`"type": "module"`).
  - Scripts:
    - `dev` = `node --watch --env-file-if-exists=../.env src/server.js`
    - `start` giống `dev` nhưng bỏ `--watch`
    - `test` = `vitest run`
  - Cài `express@^5.3 cors`. Dev: `vitest@^5 supertest`.
  - `vitest.config.js`: `test.environment = 'node'`.
- [ ] **Bước 2:** viết test đỏ. Luật phải chịu được giá trị sai kiểu (server nhận JSON tùy ý). Thông báo chốt nguyên văn:

```js
it('email', () => {
  expect(RULES.email('')).toBe('Email là bắt buộc');
  expect(RULES.email('a@b')).toBe('Email chưa đúng định dạng');
  expect(RULES.email(42)).toBe('Email là bắt buộc');
  expect(RULES.email(' a@b.vn ')).toBeNull();
});
it('grounds: ít nhất một, chỉ nhận khoá trong GROUNDS', () => {
  expect(RULES.grounds([])).toBe('Chọn ít nhất một căn cứ');
  expect(RULES.grounds('x')).toBe('Chọn ít nhất một căn cứ');
  expect(RULES.grounds(['hack'])).toBe('Căn cứ không hợp lệ');
  expect(RULES.grounds(['friendly-match'])).toBeNull();
});
it('statement: 100 đến 2000 ký tự sau trim (R6)', () => {
  expect(RULES.statement(' '.repeat(150))).toBe('Bản giải trình là bắt buộc');
  expect(RULES.statement('a'.repeat(99))).toBe('Bản giải trình cần ít nhất 100 ký tự');
  expect(RULES.statement('a'.repeat(2001))).toBe('Bản giải trình tối đa 2000 ký tự');
  expect(RULES.statement('a'.repeat(100))).toBeNull();
});
it('evidenceUrl: không bắt buộc, có thì phải https', () => {
  expect(RULES.evidenceUrl('')).toBeNull();
  expect(RULES.evidenceUrl('http://x.vn')).toBe('Link bằng chứng phải là URL https');
  expect(RULES.evidenceUrl('không phải url')).toBe('Link bằng chứng phải là URL https');
  expect(RULES.evidenceUrl('https://youtu.be/abc')).toBeNull();
});
it('confirm phải đúng true', () => {
  expect(RULES.confirm(false)).toBe('Cần xác nhận thông tin là đúng sự thật');
  expect(RULES.confirm('true')).toBe('Cần xác nhận thông tin là đúng sự thật');
  expect(RULES.confirm(true)).toBeNull();
});
it('evaluateErrors(INITIAL_VALUES) có lỗi ở email, grounds, statement, confirm', () => {
  expect(Object.keys(evaluateErrors(INITIAL_VALUES))).toEqual(['email', 'grounds', 'statement', 'confirm']);
});
```

- [ ] **Bước 3:** `npm test` → FAIL. Viết `shared/appealRules.js` (hàm thuần, không import gì). Kiểm URL bằng `URL.canParse(v) && new URL(v).protocol === 'https:'`. `npm test` → PASS.
- [ ] **Bước 4:** commit `feat(hw2): shared appeal validation rules`.

### H2-02: Store + dữ liệu hồ sơ

**Files:** tạo `server/src/dossiers.js`, `server/src/store.js`, `server/src/store.test.js`.

**Interfaces:**
- **Produces:**
  - `SEED_DOSSIERS`: 2 phần tử `himass`, `tanvuu`, dạng `Dossier` nhưng chưa có `appealDeadline` và `appeal`.
  - `createStore({ now = Date.now, slaHours = 48 } = {})` trả về:
    - `listDossiers()`
    - `getDossier(id) → Dossier|null`
    - `addAppeal(id, input: AppealInput) → Appeal`
- **Dữ kiện cho cả hai hồ sơ** (từ nguồn đã tra, xem phần Nguồn ở cuối file):
  - `sanction = { issuer: 'KRAFTON', issuedAt: '2026-09-23', kind: 'permanent', scope: 'PUBG: Battlegrounds và mọi giải đấu do KRAFTON cấp phép' }`
  - `accusation = 'Bị cáo buộc dùng thông tin ngoài trận (đá stream) tại giải giao hữu PUBG Asia Stars 2026'`
  - `factors = { eventTier: 'exhibition', ruleExplicit: false, notified: false, priorOffenses: 0 }`
  - Tên thật: Himass = `Lã Phương Tiến Đạt`, TanVuu = `Trần Tấn Vũ`.
  - `summary` một câu, lấy từ Sforum. `sources` gồm 3 đến 4 link báo.

- [ ] **Bước 1:** viết test đỏ:
  - `getDossier('himass').appealDeadline === start + 48 * 3_600_000`, với `now` giả.
  - `slaHours: 0` thì dùng 48.
  - `getDossier('nope') === null`.
  - `listDossiers()` trả `[{ id, name, appealDeadline, hasAppeal: false }]`.
  - Sau `addAppeal` thì `getDossier().appeal` có `id` (chuỗi), `playerId`, `submittedAt = now()`, và `hasAppeal: true`.
  - Thay đổi object trả ra không làm đổi store (trả bản sao `structuredClone`).
- [ ] **Bước 2:** cài cho xanh. Id đơn là `crypto.randomUUID()`.
- [ ] **Bước 3:** commit `feat(hw2-server): in-memory dossier store with fixed sla deadline`.

### H2-03: Route API + `server.js`

**Files:** tạo `server/src/app.js`, `server/src/app.test.js`, `server/src/server.js`.

**Interfaces:**
- **Consumes:** `createStore`, `evaluateErrors`, `toAppeal`.
- **Produces:** `createApp({ store, now = Date.now, clientOrigin = 'http://localhost:5175' })`.

- [ ] **Bước 1:** viết test đỏ bằng supertest. Dùng `now` giả có thể chỉnh trong test:
  - `GET /api/time` → `{ now }` đúng giá trị giả.
  - `GET /api/dossiers/himass` → 200, có `factors` và `appealDeadline`.
  - `/api/dossiers/xyz` → 404 `'Dossier not found'`.
  - `POST` hợp lệ → 201. Gửi lần hai → 409 `'Appeal already submitted'` (R5).
  - `POST` với `grounds: "x"` → 400, `fields.grounds === 'Chọn ít nhất một căn cứ'` (R6).
  - Body là mảng `[]` → 400 `'Body must be a JSON object'`.
  - Body JSON hỏng → 400 `'Invalid JSON'`.
  - Đặt `now = appealDeadline` → 409 `'Appeal window closed'` (R4).
  - Route lạ → 404 `'Not found'`.
  - Header CORS chỉ cho `http://localhost:5175`.
- [ ] **Bước 2:** cài cho xanh.
  - `express.json({ limit: '20kb' })`.
  - Error handler cuối: `entity.parse.failed` → `'Invalid JSON'`, còn lại 500.
  - Đơn đã nộp trả về là `toAppeal(body)` cộng meta.
- [ ] **Bước 3:** `server.js`:
  - Đọc `PORT` (mặc định 3003), `SLA_HOURS`, `CLIENT_ORIGIN`.
  - Log `Appeal server on http://localhost:3003, SLA deadline <ISO>`.
- [ ] **Bước 4:** `npm run dev`, rồi kiểm bằng `curl`: `curl -s localhost:3003/api/time` và `curl -s localhost:3003/api/dossiers/tanvuu`. Output ghi vào §6.
- [ ] **Bước 5:** commit `feat(hw2-server): appeal api routes`.

### H2-04: Client khung + router

**Files:** tạo `client/package.json`, `vite.config.js`, `eslint.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/App.module.css`, `src/styles/tokens.css`, `src/components/Layout.jsx`, `src/pages/NotFound.jsx`, `src/pages/DossierList.jsx` (tạm để rỗng), `src/test/setup.js`, `src/App.test.jsx`.

- [ ] **Bước 1:** chép `package.json`, `eslint.config.js` và `src/test/setup.js` từ HW1 (bỏ polyfill PointerEvent), rồi thêm `react-router@^7.18`.
  - `vite.config.js`: như HW1 nhưng `port: 5175` và `server: { fs: { allow: ['..'] } }`, để import được `../shared/appealRules.js`.
  - Cài bằng `npm install </dev/null`.
- [ ] **Bước 2:** viết test đỏ `App.test.jsx`. Render `<MemoryRouter initialEntries={[...]}><App /></MemoryRouter>`:
  - Đúng một `h1` `'Esports Fair-Play Appeal Tribunal'`.
  - Có câu ghi chú mô phỏng (xem §1).
  - `/khong-co` → heading `'Không tìm thấy trang'` và link về `/`.
- [ ] **Bước 3:** dựng route:
  - `App.jsx` chứa toàn bộ `<Routes>`: `Layout` (header, `<main>`, `<Outlet/>`) gồm `index` → `DossierList`, `dossier/:playerID` → `DossierPage` (lazy, `<Suspense fallback>` trong `role="status"`), `*` → `NotFound`.
  - `main.jsx` bọc `<BrowserRouter>`.
  - Tất cả import từ `'react-router'`.
- [ ] **Bước 4:** chạy `npm test`, `npm run lint`, `npm run build` → đều chạy được.
- [ ] **Bước 5:** commit `feat(hw2-client): scaffold client with router shell and 404`.

### H2-05: Domain: ma trận + đồng hồ

**Files:** tạo `client/src/domain/matrix.js`, `client/src/domain/clock.js` và test cạnh mỗi file.

**Interfaces:**
- **Produces:**
  - `computeMatrix(dossier) → { rows: { id, label, value: string, adjustment: number }[], offenseSeverity: number, sanctionSeverity: number, ratio: number, verdict: 'disproportionate'|'proportionate' }`.
  - `estimateOffset({ serverNow, sentAt, receivedAt }) → number`.
  - `formatRemaining(ms) → string`.

- [ ] **Bước 1:** viết test đỏ.
  - **Mô hình ma trận** (mô hình bài tập, không phải đánh giá pháp lý; ghi như vậy trong caption của bảng):
    - Mức hành vi nền là `5`.
    - Điều chỉnh:
      - `eventTier === 'exhibition'` → `-2`
      - `ruleExplicit === false` → `-1`
      - `notified === false` → `-1`
      - `priorOffenses` → `+priorOffenses`
    - Sau điều chỉnh, kẹp vào khoảng `[1, 5]`.
    - `SANCTION_SEVERITY = { warning: 1, 'match-ban': 2, '1-year': 3, permanent: 5 }`.
    - `ratio = round2(sanction / offense)`. `verdict = ratio >= 1.5 ? 'disproportionate' : 'proportionate'`.
  - **Test ma trận:**
    - Hồ sơ seed (exhibition, false, false, 0, permanent) → `offenseSeverity 1`, `ratio 5`, `'disproportionate'`, `rows.length 4`.
    - (official, true, true, 0, permanent) → `ratio 1`, `'proportionate'`.
    - `priorOffenses: 9` → `offenseSeverity 5`, không vượt trần.
  - **Test đồng hồ:**
    - `estimateOffset({ serverNow: 601_100, sentAt: 1000, receivedAt: 1200 }) === 600_000`.
    - `formatRemaining(0) === '00:00:00'`, `formatRemaining(1) === '00:00:01'` (làm tròn lên giây), `formatRemaining(172_800_000) === '48:00:00'`, `formatRemaining(-5) === '00:00:00'`.
- [ ] **Bước 2:** cài cho xanh, rồi commit `feat(hw2-client): derived disproportionality matrix and clock helpers`.

### H2-06: API client + `useDossier` + trang hồ sơ

**Files:** tạo `src/api/appealApi.js`, `src/test/fakeAppealServer.js`, `src/hooks/useDossier.js` (+ test), `src/components/DisproportionalityMatrix.jsx`, `src/pages/DossierList.jsx`, `src/pages/DossierPage.jsx`, `src/pages/DossierPage.test.jsx`.

**Interfaces:**
- **`appealApi.js`** (base là `import.meta.env.VITE_API_BASE ?? 'http://localhost:3003'`):
  - `ApiError { status, message, fields? }`
  - `fetchServerTime({signal}) → number`
  - `fetchDossiers({signal})`
  - `fetchDossier(id, {signal}) → Dossier`
  - `submitAppeal(id, input) → Appeal`
- **`installFakeAppealServer({ serverOffsetMs = 0, deadlineInMs = 3_600_000, hold = false })`:**
  - Dùng `vi.stubGlobal('fetch')` để giả cả 4 route theo đúng contract, giờ server = `Date.now() + serverOffsetMs`.
  - Trả về `{ db, calls(), state, release() }`, trong đó `state.fail` nhận `500` hoặc `'network'`.
- **`useDossier(playerId)` → `{ status: 'loading'|'ready'|'not-found'|'error', dossier, error, retry, setAppeal(appeal) }`:**
  - Fetch trong effect có `AbortController`.
  - Kết quả lưu theo khóa `{ key: playerId, ... }`. `status` là `'loading'` khi `result.key !== playerId`.

- [ ] **Bước 1:** viết test đỏ.
  - `useDossier`: 404 → `'not-found'`.
  - `useDossier`, đổi `playerId` khi request đầu còn treo (R3): request đầu nhận `signal.aborted === true`, và `dossier` không bao giờ là hồ sơ cũ khi `playerId` đã đổi.
  - `DossierPage` tại `/dossier/himass`:
    - Heading `Himass`.
    - Bảng có caption `'Ma trận bất cân xứng'`, có ô `'Bất cân xứng'`.
    - Có danh sách nguồn với link `target="_blank" rel="noreferrer"`.
  - `/dossier/HIMASS` cũng mở được.
  - `/dossier/xyz` → `'Không tìm thấy hồ sơ'` hiện trong vùng nội dung.
  - `DossierList` có link tới `/dossier/himass` và `/dossier/tanvuu`.
- [ ] **Bước 2:** cài cho xanh.
  - `DossierPage` lấy `useParams().playerID`.
  - `const matrix = useMemo(() => computeMatrix(dossier), [dossier])`, đúng mẫu slide 33. Hook đặt trước mọi `return` sớm, `dossier` null thì trả null.
  - Bảng ma trận dùng `<table>` có `<caption>` và `<th scope>`.
- [ ] **Bước 3:** commit `feat(hw2-client): dossier routes with derived matrix`.

### H2-07: `useAppealSlaTimer` + `SlaCountdown`

**Files:** tạo `src/hooks/useAppealSlaTimer.js` (+ test), `src/components/SlaCountdown.jsx`. Sửa `DossierPage.jsx` để hiện đồng hồ.

**Interfaces:**
- **Consumes:** `fetchServerTime`, `estimateOffset`, `formatRemaining`.
- **Produces:** `useAppealSlaTimer(deadlineMs: number) → { remainingMs: number, expired: boolean, synced: boolean }`.

- [ ] **Bước 1:** viết test đỏ. Dùng `vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })` và `installFakeAppealServer`:
  - **R1:** `serverOffsetMs = 600_000`, `deadline = serverNow + 60_000`. Sau khi `synced`, `remainingMs` nằm trong khoảng 60_000 ± 1_000 (không phải ~660_000).
  - **R2:** `vi.setSystemTime(Date.now() + 30_000)` mà không chạy interval, rồi đặt `document.visibilityState = 'hidden'` và chuyển lại `'visible'`, rồi dispatch `visibilitychange` → `remainingMs` giảm khoảng 30_000 ngay. Đồng thời có thêm một `GET /api/time` (resync).
  - Sau khi qua hạn: `remainingMs === 0`, `expired === true`.
  - Unmount → không còn interval, không còn listener. Request sync đang treo bị abort.
  - Sync lỗi mạng → vẫn đếm theo offset 0, `synced === false`, không throw.
- [ ] **Bước 2:** cài cho xanh. Lấy lại pattern của Lab 3 `usePubgAirdropTimer`:
  - Luôn tính `Math.max(0, deadlineMs - (Date.now() + offsetMs))`, mỗi 200ms.
  - Khi tab `visible`: tính lại ngay và gọi `resyncTimerWithServer()`, đúng tên trên slide 33.
  - Offset lấy từ `estimateOffset`, lưu trong state.
  - Một effect cho đồng hồ, một effect cho sync. Cả hai đều cleanup.
- [ ] **Bước 3:** `SlaCountdown({ deadlineMs })`:
  - Khi còn hạn: `<p role="timer" aria-label="Thời gian còn lại để kháng cáo">` hiện `formatRemaining`.
  - Khi hết hạn: chuyển thành `role="status"` với chữ `'Đã hết hạn kháng cáo'`.
  - Chưa sync thì ghi chú nhỏ `'(chưa đồng bộ giờ server)'`.
  - Component nhận `children` dạng render prop, hoặc trả `expired` lên `DossierPage`. Chọn cách nào là quyết định của người làm, miễn `DossierPage` biết `expired` để khóa form ở H2-08.
- [ ] **Bước 4:** commit `feat(hw2-client): zero-drift appeal sla timer synced to server clock`.

### H2-08: Form kháng cáo

**Files:** tạo `src/form/AppealFormContext.js`, `AppealFormProvider.jsx`, `fields.jsx`, `AppealForm.jsx` (+ test), `src/components/AppealReceipt.jsx`. Sửa `DossierPage.jsx`.

**Interfaces:**
- **Consumes:** `RULES`, `INITIAL_VALUES`, `FIELD_ORDER`, `GROUNDS`, `evaluateErrors`, `toAppeal` từ `../../../shared/appealRules.js`; `submitAppeal`.
- **Produces:**
  - `useAppealForm()` → `{ values, errors, visibleErrors, isValid, submitted, setValue, touch, markSubmitted }`. Dùng ngoài Provider thì ném lỗi `'useAppealForm must be used inside AppealFormProvider'`.
  - Field components: `TextField({ name, label, type })`, `TextArea({ name, label, maxLength })` (hiện bộ đếm `n/2000`), `CheckboxGroup({ name, legend, options })` (dùng `fieldset` + `legend`), `Checkbox({ name, label })`.
  - `AppealForm({ playerId, disabled, onSubmitted(appeal) })`.
  - `AppealReceipt({ appeal })`.

- [ ] **Bước 1:** viết test đỏ `AppealForm.test.jsx` (user-event):
  - Gõ `a@b` rồi rời field → hiện `'Email chưa đúng định dạng'`, `aria-invalid="true"`. Gõ tiếp `.vn` → lỗi biến mất ngay (real-time).
  - Field chưa chạm thì không hiện lỗi.
  - Bấm Nộp khi form trống → hiện mọi lỗi, focus vào ô email (field lỗi đầu tiên theo `FIELD_ORDER`), không có `POST`.
  - Điền hợp lệ rồi click Nộp hai lần → `calls()` chỉ có một `POST`, nút disabled khi đang gửi (R5).
  - `disabled` (hết hạn) → nút Nộp disabled (R4).
  - Server trả 409 `'Appeal window closed'` → hiện `role="alert"` chứa câu đó.
  - Server trả 400 `fields` → hiện lỗi đó dưới field tương ứng.
  - Trong `DossierPage`: nộp xong thì hiện `AppealReceipt` (`'Đã nộp đơn lúc ...'`) thay cho form. Render lại trang (F5) với `db` đã có đơn → vẫn hiện biên nhận (R5).
- [ ] **Bước 2:** cài cho xanh.
  - Provider làm theo mẫu `Exercise_Lab04/client/src/sprint2-form/FormProvider.jsx`.
  - Focus field lỗi: dùng `form.elements.namedItem(name)`. Nếu là `RadioNodeList` thì focus phần tử `[0]`.
  - `DossierPage` truyền `disabled={expired}`. `onSubmitted` gọi `setAppeal`.
- [ ] **Bước 3:** grep `useEffect` trong `src/form` → 0 dòng. Chạy `npm run lint`.
- [ ] **Bước 4:** commit `feat(hw2-client): context-driven appeal form with real-time validation`.

### H2-09: CSS tối giản, README, kiểm chứng thủ công

- [ ] **Bước 1:** viết `tokens.css` (màu dạng biến, tương phản ≥ 4.5:1), layout một cột tối đa `48rem`, responsive tới 320px, `:focus-visible` rõ ràng.
- [ ] **Bước 2:** viết `README.md`: cách chạy (`cp .env.example .env`; trong `server/` chạy `npm i && npm run dev`; trong `client/` chạy `npm i && npm run dev`), cách demo hết hạn bằng `SLA_HOURS=0.01`, lệnh test.
- [ ] **Bước 3:** chạy thật trên Edge và kiểm từng luồng:
  - Mở `/dossier/himass` → đồng hồ chạy.
  - Đổi giờ máy hoặc ẩn tab 30 giây → số vẫn đúng.
  - Nộp đơn → F5 → vẫn thấy biên nhận.
  - `SLA_HOURS=0.01` → hết hạn thì form khóa.
  - `/dossier/xyz` → 404.

  Chụp ảnh vào `evidence/` ở khổ 375px và 1280px.
- [ ] **Bước 4:** chạy `npm test` cả hai project, `npm run lint`, `npm run build`, và các grep cấm ở §1. Ghi kết quả vào §6.
- [ ] **Bước 5:** commit `docs(hw2): readme and verification evidence`. Cập nhật trạng thái HW2 trong `../TASK_DECOMPOSITION.md`.

### H2-10: `AI_FAILURE_AUDIT.md` (người dùng viết)

Slide 21 và slide 18 tính phần này 15% điểm. **AI không viết nội dung này** (theo [Agents.md](../Agents.md)): không bịa prompt, output, bằng chứng hay commit hash.

- [ ] **Bước 1:** người dùng điền vào `../AI_FAILURE_AUDIT.md` theo khung có sẵn (Prompt / Output sai / Vì sao sai / Bằng chứng / Cách sửa), dùng lỗi thật gặp trong quá trình làm. Gợi ý loại lỗi slide yêu cầu: API ảo (hallucinated), vòng lặp effect, và các bước kiểm chứng thủ công.
- [ ] **Bước 2:** AI chỉ được kiểm tra định dạng và link, khi người dùng nhờ.

## 6. Kết quả kiểm chứng

Đo ngày 2026-11-26, chạy trên máy phát triển (Node 26, Edge headless).

| Hạng mục | Kết quả |
|---|---|
| Server `npm test` | 30/30 (luật dùng chung 8, store 7, API 15) |
| Client `npm test` | 42/42 (domain 8, `useDossier` 5, `useAppealSlaTimer` 7, trang hồ sơ 6, form 14, App 2) |
| `npm run lint` (client) | 0 lỗi |
| `npm run build` (client) | chạy được, có tách chunk `DossierPage` |
| Grep cấm (§1) | 0 dòng: `react-router-dom\|keyCode\|defaultProps\|dangerouslySetInnerHTML`; `useEffect` trong `form/` và `domain/`; `s - 1\|remaining - ` trong hook timer |
| `curl` trên server thật (H2-03) | `/api/time`, `/api/dossiers`, `/api/dossiers/tanvuu` trả 200; POST sai kiểu trả 400 kèm `fields` |
| E2E trên Edge headless | 15/15, xem [evidence/e2e-edge.json](evidence/e2e-edge.json) và 7 ảnh `evidence/0*.png` (1280px và 375px) |
| Review cả nhánh (subagent) | 6 phát hiện: 3 sửa (test đỏ rồi xanh), 3 Minor để lại |

E2E đã kiểm: đồng hồ khớp hạn của server (lệch dưới 2 giây) và giảm theo thời gian; lỗi email hiện sau khi rời ô và mất khi gõ đúng; bấm Nộp khi còn lỗi thì focus vào ô lỗi đầu; nộp xong và F5 vẫn thấy biên nhận; nộp lần hai bị 409; `/dossier/xyz` hiện 404 trong vùng nội dung; `/dossier/TANVUU` mở được; `SLA_HOURS` nhỏ thì hết hạn, form khóa và server trả 409.

**Phát hiện Minor để lại (chưa sửa):**
- Lỗi charset hoặc encoding lạ của body-parser trả 500 thay vì 415.
- `/api/time` trả body sai định dạng thì đồng hồ hiện `NaN:NaN:NaN`.
- Server nhận `grounds` trùng nhau, biên nhận sẽ có key React trùng.

## Nguồn dữ kiện hồ sơ

- [Tuổi Trẻ: lifetime bans](https://news.tuoitre.vn/vietnamese-pubg-stars-himass-tanvuu-handed-lifetime-bans-as-ruling-sparks-backlash-103260924100621514.htm)
- [Thể Thao Văn Hóa: toàn cảnh](https://thethaovanhoa.vn/toan-canh-vu-himass-va-tanvuu-bi-cam-thi-dau-pubg-vinh-vien-tranh-cai-tu-giai-giao-huu-toi-lan-song-xoa-game-20260923205622061.htm)
- [VnExpress: cấm toàn cầu](https://vnexpress.net/chinh-thuc-himass-va-tanvuu-bi-ban-khoi-toan-bo-giai-dau-pubg-toan-cau-cong-dong-viet-nam-dong-loat-xoa-pubg-5123928.html)
- [Sforum: Himass và TanVuu là ai](https://cellphones.com.vn/sforum/himass-va-tanvuu-la-ai)
