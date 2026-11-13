# TASK_DECOMPOSITION — Exercise Lab 04: Multi-Route SPA, Context Form Engine, Full-Stack Forum

> Nguồn đề: [docs/Context.md](../docs/Context.md), slide 2, 7, 9 đến 17, 22 đến 27. Một bài, ba sprint, dùng chung một app React 19 (ba route) và một server Express.
> Luật: mỗi prompt AI tham chiếu **đúng một task ID**. AI không tự commit. Tick `[x]` chỉ khi đã chạy lệnh ở cột Gate và thấy output thật.
> Mục "Quyết định của mình" ghi các chỗ slide không nói hoặc mâu thuẫn. Đó là đề xuất để bạn sửa, không phải điều đã thống nhất.

## 1. Tổng quan

| Sprint | Thời lượng | Route | Thư mục code | Kỹ năng chính |
|---|---|---|---|---|
| 0 | Block 1 (0-40 phút) | — | gốc bài | Khởi tạo, rules, WBS |
| 1 | 40-75 phút | `/people`, `/people/:id` | `client/src/sprint1-router/` | React Router v7, `<Outlet>`, `useParams`, 404, CSS Grid, `lazy` + `Suspense` |
| 2 | 75-120 phút | `/form` | `client/src/sprint2-form/` | Context, validation đồng bộ (0 `useEffect`), `useId`, aria |
| 3 | 120-155 phút | `/forum` | `client/src/sprint3-forum/`, `server/` | `AbortController`, Express REST, CORS, kiểm tra payload |
| 4 | 155-180 phút | — | — | Bảo vệ 3 phút, `AI_FAILURE_AUDIT.md` |

### 1.1 Cấu trúc thư mục đích

```text
Exercise_Lab04/
  TASK_DECOMPOSITION.md
  evidence/
  client/                  project Vite độc lập (package.json riêng)
    index.html
    vite.config.js
    eslint.config.js
    src/
      main.jsx             createRoot + StrictMode + BrowserRouter
      App.jsx              toàn bộ <Routes> nằm ở đây
      AppLayout.jsx        thanh điều hướng ba mục + <Outlet/>
      NotFound.jsx
      styles/tokens.css
      test/setup.js
      sprint1-router/      people.json, PeopleLayout, PersonDetail, PersonDetailSkeleton
      sprint2-form/        FormContext, FormProvider, rules, InputField, SimpleForm, ShowData
      sprint3-forum/       useForumMessages, ChannelSwitcher, MessageList, PostForm, ForumPage
  server/                  project Node độc lập (package.json riêng)
    src/app.js             createApp(): express.json, cors, routes (export, không listen)
    src/store.js           kho tin nhắn trong bộ nhớ
    src/server.js          đọc .env, listen
```

Mỗi project chạy `npm` ngay trong folder của nó (như Lab03). Gốc repo chỉ giữ tài liệu.

### 1.2 Stack (nối tiếp Lab03)

- JavaScript (`.jsx`) + JSDoc contract. CSS Modules + CSS custom properties. Không Tailwind, không UI framework.
- React 19, `react-router` v7 (import từ `'react-router'`, không phải `'react-router-dom'`).
- Vitest + jsdom + React Testing Library ở client. Vitest + supertest ở server.
- ESLint 9 với `react-hooks` và `jsx-a11y` (cấu hình sao chép từ Lab03 Ex2).
- Server: Express, `cors`, `dotenv` hoặc `node --env-file`; **không Mongoose** ở bài này (Mongoose thuộc Homework 2).

## 2. Quyết định của mình (cần bạn xác nhận hoặc sửa)

| # | Chỗ slide thiếu hoặc mâu thuẫn | Mình chọn | Lý do |
|---|---|---|---|
| D1 | Slide 2 dùng `createBrowserRouter`, slide 10 dùng `<Routes>` | Declarative: `<BrowserRouter>` + `<Routes>`, `react-router` ghim v7 | Khớp slide 4, 10, 33; ít khái niệm hơn khi bảo vệ |
| D2 | Dữ liệu people không có trong slide | Sao chép `people.json` từ Lab03 Ex2 (`sp-1` đến `sp-7`, ID chuỗi) | ID là chuỗi nên `p.id === id` đúng; vẫn test `/people/sp-999` để chắc 404 |
| D3 | `PersonDetail` slide hiện `Name` và `Role`, dữ liệu Lab03 chỉ có `name`, `age`, `iq` | Hiện `Name`, `Age`, `IQ` | Không bịa trường `role` |
| D4 | Ba dạng API khác nhau (slide 16, 25, 26) | `/api/channels/:channel/messages` cho cả GET và POST | Slide 16 và 17 dùng từ "channel"; ghi vào [shared/api-contract.md](../shared/api-contract.md) trước khi code |
| D5 | Slide không nói form có field nào | Form "Thêm người": `name`, `email`, `age`, `iq` | Nối với dữ liệu Sprint 1; có đủ kiểu luật (bắt buộc, regex, khoảng số) |
| D6 | Slide 14 gọi `useId()` một lần ở Provider, mọi field sẽ trùng `id` | `useId()` trong **từng `InputField`** | Tránh lỗi trùng `id`; ghi vào audit |
| D7 | Slide 23 đặt tên `FormContext.js` nhưng chứa JSX | `FormContext.js` chỉ có `createContext` + `useFormContext`; JSX ở `FormProvider.jsx` | JSX phải ở file `.jsx` |
| D8 | Slide 24 để `role="alert"` ở mỗi lỗi | Lỗi từng field gắn bằng `aria-describedby`; `role="alert"` chỉ ở thông báo khi bấm gửi mà còn lỗi | Mỗi phím gõ mà đọc lỗi là gây nhiễu; WCAG 4.1.3 |
| D9 | Lỗi hiện ngay khi trang mở (slide 14) | Chỉ hiện lỗi của field đã `blur` hoặc sau khi bấm gửi | Form trống không nên báo lỗi đầy màn hình; `touched` là state, không cần `useEffect` |
| D10 | Slide 9 đặt `aria-live` trên skeleton | Vùng `role="status"` luôn có mặt bao ngoài skeleton | Live region phải tồn tại trước khi nội dung đổi |
| D11 | Slide 25 `loading` không reset khi đổi kênh; không kiểm `res.ok` | Trạng thái dẫn xuất theo kênh (mục 5.3) và kiểm `res.ok` | Tránh hiện tin nhắn kênh cũ |
| D12 | Slow 3G khó bắt kịp request đang chạy trên server nhanh | Server có `RESPONSE_DELAY_MS` (mặc định 0) | Chỉ để kiểm chứng; không đổi hợp đồng API |
| D13 | Slide 26 thiếu `express.json()` | Có `express.json()` và middleware bắt JSON hỏng trả 400 | Không có thì `req.body` là `undefined` và server crash |
| D14 | Client gọi server bằng proxy hay CORS | Client gọi thẳng `VITE_API_BASE` (mặc định `http://localhost:3001`); server bật CORS cho `http://localhost:5173` | Đề yêu cầu CORS; proxy sẽ làm CORS không bao giờ được kiểm |
| D15 | Exercise 1.1 (lazy) có nằm trong hai commit của Sprint 1 không | Làm sau hai commit bắt buộc, thành commit thứ ba | Slide 12 chỉ yêu cầu hai commit cho Sprint 1 |

## 3. Sprint 0: khởi tạo (Block 1, 0-40 phút)

| ID | Task | Gate | Trạng thái |
|---|---|---|---|
| S0-01 | Chốt D1 đến D15 với mình | Bạn trả lời "ok" | [x] |
| S0-02 | Viết [docs/project-rules.md](../docs/project-rules.md) và [Agents.md](../Agents.md) (chuyển từ Lab03, chỉnh cho Lab04) | Hai file có nội dung, không còn dòng "chưa viết" | [x] |
| S0-03 | Viết [shared/api-contract.md](../shared/api-contract.md) theo mục 6.2 | Có đủ route, mã trạng thái, giới hạn field | [x] |
| S0-04 | `git init` và các commit tài liệu | `git log` đọc được từng bước | [x] |
| S0-05 | Dựng `client/`: sao chép cấu hình Lab03 Ex2, đổi `name`, thêm `react-router` **ghim v7** (bản mới nhất là v8, `npm install react-router` không ghim sẽ kéo nhầm), `npm install` | `npm test`, `npm run lint`, `npm run build` đều sạch | [x] |
| S0-06 | Dựng `server/`: `package.json` (`express`, `cors`; dev: `vitest`, `supertest`), script `dev`, `start`, `test` | `npm install` sạch; `npm test` chạy (0 test) | [x] |
| S0-07 | `Exercise_Lab04/.env.example` (server và client dùng chung qua `envDir: '..'` và `--env-file-if-exists=../.env`) | `.env` không nằm trong `git status` | [x] |
| S0-08 | `main.jsx` dùng `createRoot` + `StrictMode` + `BrowserRouter`; `App.jsx` là khung tạm | Test smoke xanh; build chạy | [x] |

Các commit của Sprint 0 (đã tách nhỏ):

| # | Message | Nội dung |
|---|---|---|
| 1 | `chore: scaffold lab04 repo structure` | `.gitignore`, `package.json`, `README.md`, `.env.example`, folder rỗng, WBS Homework |
| 2 | `docs: add lab04 slide context` | `docs/Context.md` |
| 3 | `docs: add exercise task decomposition` | WBS này |
| 4 | `docs: add agent rules and project rules` | `Agents.md`, `docs/project-rules.md` |
| 5 | `docs: define forum api contract` | `shared/api-contract.md` |
| 6 | `chore(client): init react19 vite client with react-router v7` | `client/` |
| 7 | `chore(server): init express server project` | `server/`, `Exercise_Lab04/.env.example` |
| 8 | `docs: add run instructions to readme` | `README.md` |
| 9 | `docs: tick sprint 0 in exercise wbs` | cập nhật WBS |

## 4. Sprint 1: Router (40-75 phút)

### 4.1 Mục tiêu và ràng buộc (slide 10, 11, 12, 22)

Danh bạ master-detail. Danh sách bên trái, chi tiết bên phải, URL `/people/:id`.
**Ràng buộc cứng:** dùng `<Outlet/>` và `useParams()`; `people.find()` cho tra cứu; 404 khi `id` sai; `<dl>/<dt>/<dd>` cho thuộc tính; không `<Switch>`, `component=`, `exact`; hai commit đúng nguyên văn; Console không warning.

### 4.2 Contract

```text
/                  chuyển hướng sang /people (replace)
/people            PeopleLayout; con index: gợi ý "Chọn một người"
/people/:id        PersonDetail (lazy ở S1-09); id không tồn tại: 404 trong vùng nội dung
/form, /forum      chỗ trống đến Sprint 2 và 3
*                  NotFound toàn trang
```

```js
/** @typedef {{ id: string, name: string, age: number, iq: number }} Person */
// PeopleLayout({ people }): <nav> NavLink + <main><Outlet/></main>
// PersonDetail({ people }): useParams().id -> people.find; không có thì <NotFound/>
```

Hành vi chốt:
- `NavLink` có `aria-current="page"` tự động; kiểu `active` **không chỉ dựa vào màu** (thêm gạch bên cạnh, WCAG 1.4.1).
- `AppLayout` có `<header><nav aria-label="Chính">` với ba liên kết People, Form, Forum.
- Grid: `grid-template-columns: minmax(280px, 1fr) 2fr`; dưới 640px chuyển một cột (nếu không, 280px + 2fr tràn ở 320px).

### 4.3 Task

| ID | Task | File | Gate | Trạng thái |
|---|---|---|---|---|
| S1-01 | Sao chép `people.json`; bọc `PEOPLE` đóng băng | `sprint1-router/people.js` (+ test) | Test: `id` duy nhất, chuỗi, frozen | [x] |
| S1-02 | `App.jsx` với `<Routes>`, `AppLayout`, chuyển hướng `/`, route `*` | `App.jsx`, `AppLayout.jsx`, `NotFound.jsx` | Test với `MemoryRouter`: `/` về `/people`; `/xyz` hiện NotFound | [x] |
| S1-03 | `PeopleLayout`: `NavLink` cho từng người, `<Outlet/>` | `PeopleLayout.jsx` | Test: bấm tên thì URL đổi; link hiện tại có `aria-current` | [x] |
| S1-04 | CSS Grid master-detail, một cột dưới 640px | `PeopleLayout.module.css` | Ảnh 320px và 1440px trong `evidence/`; không cuộn ngang | [x] |
| S1-05 | **Commit C2**: `feat: router layout` (S1-02, S1-03); CSS tách thành `style(sprint1): add responsive master-detail grid in lab03 style` (S1-04) | — | Mỗi commit chỉ gồm file của task đó | [x] |
| S1-06 | `PersonDetail`: `useParams`, `people.find`, `<dl>` | `PersonDetail.jsx` | Test: `/people/sp-2` hiện Albert Einstein | [x] |
| S1-07 | Xử lý 404: `<NotFound/>` với `role="alert"` trong vùng nội dung | `PersonDetail.jsx` | Test: `/people/sp-999` và `/people/%20` đều ra 404, không throw | [x] |
| S1-08 | **Commit C3**: `feat: detail route handling` | — | Console DevTools 0 warning khi đi hết các route; ảnh vào `evidence/` | [ ] |
| S1-09 | `lazy(() => import('./PersonDetail'))` + `Suspense` quanh `<Outlet/>` | `PeopleLayout.jsx` | Build thấy chunk riêng của `PersonDetail` | [x] |
| S1-10 | Skeleton đúng kích thước, bọc vùng `role="status"` cố định (D10) | `PersonDetailSkeleton.jsx` | Lighthouse CLS = 0 khi vào `/people/sp-2` với Slow 3G. Bằng chứng: [evidence/lighthouse-sprint1-preview.png](evidence/lighthouse-sprint1-preview.png) (bản `npm run preview`: Performance 100, Accessibility 100, Best Practices 100, SEO 82). Ảnh chỉ có điểm tổng, chưa đọc ra số CLS riêng | [x] |
| S1-11 | Commit tách hai bước: `perf: lazy load PersonDetail route` (S1-09) và `feat(sprint1): add dimension-matched skeleton with status region` (S1-10) | — | Test cũ vẫn xanh (dùng `findBy`) | [x] |

Cổng cuối Sprint 1: `npm test`, `npm run lint`, `npm run build` đều sạch.

## 5. Sprint 2: Context Form Engine (75-120 phút)

### 5.1 Mục tiêu và ràng buộc (slide 13, 14, 15, 23, 24)

Form "Thêm người" với validation tính ngay trong lúc render.
**Ràng buộc cứng:** **0 `useEffect`** trong `sprint2-form/`; `createContext` + `useContext`; `useId` cho nhãn; `aria-invalid` và `aria-describedby`; `<ShowData/>` hiện khi submit hợp lệ; ba commit đúng nguyên văn.

### 5.2 Contract

```js
/** @typedef {{ name: string, email: string, age: string, iq: string }} Values */
/** @typedef {Record<keyof Values, string | null>} Errors */
// rules: { [field]: (value, allValues) => string | null }   // lỗi trả về null khi hợp lệ
evaluateErrors(values, rules)   // hàm thuần: -> { [field]: message }, chỉ chứa field có lỗi
```

- Luật nhận `(value, allValues)` ngay từ đầu để thử thách **validation chéo** ở buổi bảo vệ chỉ cần thêm một luật.
- Luật mặc định: `name` bắt buộc, 2 đến 60 ký tự sau `trim`; `email` có dạng `a@b.c`; `age` là số nguyên 1 đến 150; `iq` là số 50 đến 300.
- Giá trị trong state luôn là chuỗi (đúng với `<input>`); chuyển sang số ở bước hiển thị.
- `FormProvider` giữ `values`, `touched`, `submitted` (state), và tính `errors`, `isValid`, `visibleErrors` (dẫn xuất).
- Context value: `{ values, errors, visibleErrors, isValid, submitted, setValue, touch, markSubmitted }`.

### 5.2.1 Luật và thông báo (đã chốt)

Mỗi luật kiểm theo thứ tự, trả về thông báo **đầu tiên** không đạt. Giá trị được `trim` trước khi kiểm.

| Field | Thứ tự kiểm | Thông báo |
|---|---|---|
| `name` | rỗng; ngắn hơn 2; dài hơn 60 | "Họ tên là bắt buộc"; "Họ tên cần ít nhất 2 ký tự"; "Họ tên tối đa 60 ký tự" |
| `email` | rỗng; không khớp `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | "Email là bắt buộc"; "Email chưa đúng định dạng" |
| `age` | rỗng; không khớp `/^\d+$/`; ngoài 1 đến 150 | "Tuổi là bắt buộc"; "Tuổi phải là số nguyên"; "Tuổi từ 1 đến 150" |
| `iq` | rỗng; không khớp `/^\d+(\.\d+)?$/`; ngoài 50 đến 300 | "IQ là bắt buộc"; "IQ phải là số"; "IQ từ 50 đến 300" |

`INITIAL_VALUES` (bốn chuỗi rỗng) và `RULES` cùng nằm ở `rules.js`: danh sách field chỉ khai báo một chỗ.

### 5.2.2 Giao diện

- `age` và `iq` dùng `type="text"` + `inputMode="numeric"`, **không** dùng `type="number"`: trình duyệt trả chuỗi rỗng cho đầu vào sai, nên luật "phải là số" sẽ không bao giờ thấy chữ người dùng gõ.
- Nhãn nằm trên ô nhập, thông báo lỗi nằm dưới ô (chữ, không chỉ màu; ô lỗi có viền dày hơn).
- Bề mặt, màu, khoảng cách theo Lab03 (cùng token và kiểu panel với Sprint 1). Nút gửi dùng kiểu nút accent của Lab03 (`reset`).
- Route `/form` đổi từ `Placeholder` sang `SimpleForm` ở S2-04.

### 5.3 Task

| ID | Task | File | Gate | Trạng thái |
|---|---|---|---|---|
| S2-01 | `rules` và `evaluateErrors` (hàm thuần) | `rules.js` (+ test) | Test: từng luật, biên 1/150 và 50/300, chuỗi rỗng, khoảng trắng | [x] |
| S2-02 | `FormContext.js` (`createContext`, `useFormContext` ném lỗi nếu thiếu Provider) | `FormContext.js` | Test: dùng hook ngoài Provider thì ném lỗi dễ hiểu | [x] |
| S2-03 | `FormProvider`: `values`, `touched`, `submitted`; `errors` dẫn xuất | `FormProvider.jsx` | `grep -c useEffect` = 0 | [x] |
| S2-04 | `SimpleForm` khung: `<form noValidate>` + `<fieldset>` + nút gửi | `SimpleForm.jsx` | Test: render không lỗi, không warning | [x] |
| S2-05 | **Commit C5**: `feat: form context` (S2-02 đến S2-04); luật tách commit riêng `feat(sprint2): add pure validation rules` (S2-01) | — | Mỗi commit chỉ gồm file của task đó | [x] |
| S2-06 | `InputField`: `useId`, `<label htmlFor>`, `aria-invalid`, `aria-describedby`, `<p id>` lỗi (D6, D8, D9) | `InputField.jsx` | Test: gõ sai rồi blur thì thấy lỗi và `aria-describedby` trỏ đúng `id`; mở trang chưa có lỗi | [x] |
| S2-07 | Mỗi `InputField` có `id` khác nhau | `InputField.test.jsx` | Test: bốn field cho bốn `id` phân biệt | [x] |
| S2-08 | **Commit C6**: `feat: input field validation` (S2-06 tách commit riêng `feat(sprint2): add accessible InputField bound to form context`) | — | Test tự động đã xác nhận một phím = một commit render (`Profiler` trong `SimpleForm.test.jsx`); **còn chờ ảnh React DevTools Profiler của bạn** vào `evidence/` | [ ] |
| S2-09 | `onSubmit`: `preventDefault`; còn lỗi thì `submitted=true` và `role="alert"` tóm tắt; hợp lệ thì lưu `submittedData` | `SimpleForm.jsx` | Test: gửi form trống ra tóm tắt lỗi; không có dữ liệu hiển thị | [ ] |
| S2-10 | `ShowData`: `<dl>` từ `Object.entries`, chuyển `age` và `iq` sang số | `ShowData.jsx` | Test: gửi form hợp lệ hiện đủ bốn cặp `dt/dd` | [ ] |
| S2-11 | **Commit C7**: `feat: inspector output` | — | `npm test`, `npm run lint` sạch; bàn phím điều khiển được toàn bộ form | [ ] |

## 6. Sprint 3: Full-stack hook và Express API (120-155 phút)

### 6.1 Mục tiêu và ràng buộc (slide 16, 17, 25, 26)

Diễn đàn nhỏ ba kênh `nasa`, `esports-tribunal`, `notNasa`.
**Ràng buộc cứng:** `AbortController` huỷ request khi đổi kênh; guard `signal.aborted`; CORS; kiểm tra payload POST ở server; `<Fragment key={msg.id}>` trong `<dl>`; kiểm chứng Slow 3G; lưu error log.

### 6.2 Hợp đồng API (ghi thành [shared/api-contract.md](../shared/api-contract.md) ở S0-03)

| Route | Thành công | Lỗi |
|---|---|---|
| `GET /api/channels/:channel/messages` | `200` mảng `Message` tăng dần theo `timestamp` | `404 { error }` nếu kênh không thuộc ba kênh |
| `POST /api/channels/:channel/messages` | `201` `Message` vừa tạo | `400 { error }` thiếu hoặc rỗng sau `trim`, sai kiểu, `author` > 40, `text` > 500, JSON hỏng; `404` kênh lạ |

```js
/** @typedef {{ id: string, author: string, text: string, timestamp: string }} Message */  // timestamp: ISO 8601
```

`id` do server sinh bằng `crypto.randomUUID()`; client không được gửi `id` hay `timestamp` (server bỏ qua nếu có). Giới hạn 40 và 500 viết ở hai nơi (server và `PostForm`) kèm ghi chú trỏ về file hợp đồng; hai project độc lập nên không import chéo.

### 6.3 Hành vi hook

```js
useForumMessages(channel) -> { messages, status, error, postMessage }
// status: 'loading' | 'success' | 'error'
```

- Kết quả lưu theo kênh: `{ channel, messages, error }`. Nếu `result.channel !== channel` thì `status` là `'loading'` (dẫn xuất, **không** `setState('loading')` đầu effect). Dữ liệu kênh cũ không bao giờ hiện cho kênh mới.
- Trong effect: `new AbortController()`; `fetch` với `signal`; kiểm `res.ok` (không ok thì ném); `AbortError` bị bỏ qua; mọi `setState` đứng sau `if (!controller.signal.aborted)`; cleanup gọi `controller.abort()`.
- `postMessage(payload)`: `POST`; thành công thì tăng `reloadKey` (state nằm trong dependency của effect) để tải lại; lỗi thì ném cho `PostForm` hiển thị.

### 6.4 Task

| ID | Task | File | Gate | Trạng thái |
|---|---|---|---|---|
| S3-01 | `store.js`: ba kênh, vài tin mẫu mỗi kênh, `getMessages`, `addMessage` | `server/src/store.js` (+ test) | Test: kênh lạ trả `undefined`; `getMessages` trả bản sao | [ ] |
| S3-02 | `createApp()`: `express.json()`, `cors`, `GET`, trả 404 kênh lạ | `server/src/app.js` | Test supertest: 200 mảng, 404 | [ ] |
| S3-03 | `POST` với kiểm tra payload (mục 6.2), middleware lỗi JSON, `RESPONSE_DELAY_MS` | `app.js` | Test: bảng 400 (thiếu, rỗng, quá dài, sai kiểu, JSON hỏng); 201 có `id` và `timestamp` do server | [ ] |
| S3-04 | `server.js`: đọc `PORT`, `listen` | `server/src/server.js` | `curl localhost:3001/api/channels/nasa/messages` trả JSON | [ ] |
| S3-05 | **Commit C8**: `feat(server): add express messages api with validation` | — | `npm test` ở `server/` xanh | [ ] |
| S3-06 | `useForumMessages` theo mục 6.3 | `useForumMessages.js` (+ test) | Test với `fetch` giả: đổi kênh nhanh thì kết quả cũ không ghi đè; `res.ok` false thì `status='error'` | [ ] |
| S3-07 | **Commit C9**: `feat: useForumMessages with abort and derived status` | — | `grep -c "setState" ` ngoài nhánh `!aborted` không còn | [ ] |
| S3-08 | `ChannelSwitcher`, `MessageList` (`<dl>`, `<Fragment key={msg.id}>`), vùng `role="status"` cho tải | `ForumPage.jsx` và component con | Test: bấm kênh thì danh sách đổi; lỗi hiện `role="alert"` với nút Thử lại | [ ] |
| S3-09 | `PostForm`: hai ô có nhãn, kiểm tra giới hạn ở client, gọi `postMessage` | `PostForm.jsx` | Test: gửi hợp lệ thì tin mới xuất hiện; vượt giới hạn thì không gọi server | [ ] |
| S3-10 | **Commit C10**: `feat: forum page with channel switcher` | — | `npm run lint` sạch | [ ] |
| S3-11 | Kiểm Slow 3G: bật `RESPONSE_DELAY_MS=2000`, đổi kênh nhanh | DevTools Network | Ảnh có request cũ ghi `(canceled)` vào `evidence/` | [ ] |
| S3-12 | Kiểm lỗi: tắt server, mở `/forum` | DevTools Console | Giao diện hiện lỗi; lưu log vào `evidence/error-log.txt` | [ ] |

## 7. Sprint 4: bảo vệ và tài liệu (155-180 phút)

### 7.1 Bản đồ thử thách bảo vệ (slide 27)

Mỗi thử thách phải sửa được trong 3 phút. Thiết kế ở trên chừa sẵn chỗ:

| Thử thách | Sửa ở đâu | Điều đã chuẩn bị |
|---|---|---|
| Đồng bộ state với URL (`useSearchParams`) | `PeopleLayout.jsx` (thêm ô lọc) | Danh sách người nằm ở một component, state lọc ở một chỗ |
| Validation chéo (confirm password) | `rules.js` | Luật nhận `(value, allValues)` |
| Tự thử lại với backoff | `useForumMessages.js` | Một hàm `fetch` duy nhất bọc `signal` |
| Route guard | `App.jsx` | Toàn bộ `<Routes>` ở một file |

### 7.2 Task

| ID | Task | Gate | Trạng thái |
|---|---|---|---|
| S4-01 | Tự giải thích được kiến trúc ba sprint và vì sao state nằm ở từng chỗ, không nhìn code | Nói trôi chảy trong 3 phút | [ ] |
| S4-02 | Tập sửa từng thử thách ở 7.1 trên nhánh nháp | Mỗi thử thách xong trong 3 phút, test vẫn xanh | [ ] |
| S4-03 | `docs/AI_FAILURE_AUDIT.md`: bạn điền, AI chỉ chỉnh câu chữ | Có bằng chứng DevTools cho từng mục | [ ] |
| S4-04 | Xuất prompt log vào `docs/prompt_logs/` cho từng sprint | Có một file mỗi sprint | [ ] |
| S4-05 | `.env.example` đủ, repo sạch chạy được từ đầu (một lệnh cài, một lệnh chạy cho mỗi project) | Clone mới chạy được | [ ] |

## 8. Lỗi trong slide cần tránh (ứng viên cho audit)

Danh sách này là việc mình đã đọc ra từ slide. Bằng chứng DevTools và nội dung audit do bạn tự làm.

| Slide | Lỗi | Task chặn nó |
|---|---|---|
| 10 | `Layout` trả về hai phần tử ngang hàng không bọc Fragment; `NavLink` thiếu `to` | S1-02 |
| 14 | Một `useId()` chung ở Provider làm mọi field trùng `id` | S2-07 |
| 22 | So sánh `p.id === id` sai kiểu nếu ID là số | S1-07 |
| 24 | `...props` không chuyển vào `<input>` nên mất `value` và `onChange` | S2-06 |
| 25 | Không kiểm `res.ok`; `loading` không reset khi đổi kênh | S3-06 |
| 26 | Thiếu `express.json()`; ba dạng route khác nhau giữa slide | S0-03, S3-03 |
| 29 | `showModal()` khi đã mở thì ném `InvalidStateError` (thuộc Homework) | — |

## 9. Cổng kiểm tra cuối bài

- `npm test`, `npm run lint`, `npm run build` sạch ở `client/`; `npm test` sạch ở `server/`.
- `grep -rc useEffect client/src/sprint2-form` = 0.
- Console DevTools 0 warning ở ba route.
- `evidence/` có: ảnh 320px và 1440px, Profiler một lần render mỗi phím, Network `(canceled)`, `error-log.txt`.
- Mười commit (C1 đến C10) đúng nguyên văn ở trên, mỗi commit atomic.
