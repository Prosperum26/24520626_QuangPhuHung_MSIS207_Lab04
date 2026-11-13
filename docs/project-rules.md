# Project Rules — Lab 04 (Router, Context Form, Full-Stack)

> Nạp file này cho mọi AI assistant dùng trong repo. Nếu yêu cầu mâu thuẫn với file này, dừng lại và chỉ ra mâu thuẫn thay vì âm thầm phá luật.
> Nguồn: **[Thầy]** = từ slide Lab 4, **[Lab 2/3]** = kế thừa, **[Cá nhân]** = mình đặt thêm.
> Bối cảnh: [Context.md](Context.md). Luật riêng cho AI: [../Agents.md](../Agents.md). WBS bài: [../Exercise_Lab04/TASK_DECOMPOSITION.md](../Exercise_Lab04/TASK_DECOMPOSITION.md).

## 1. Triết lý và hợp đồng kiểm chứng [Thầy]

> HTML là nền. CSS tăng trình bày. JavaScript tăng hành vi. AI tăng tốc developer.

Hợp đồng kiểm chứng full-stack (slide 3):

1. Thiết kế API theo hướng contract-first.
2. Validation ở client và server phải khớp nhau.
3. Không có promise rejection bị bỏ sót, không có vòng lặp effect.
4. State cập nhật tất định trong một lượt render.

## 2. Stack [Thầy + Lab 3]

- **Client:** React 19, Vite, `react-router` v7 (import từ `'react-router'`), JavaScript `.jsx` với contract bằng JSDoc, CSS Modules + CSS custom properties.
- **Server:** Node, Express, `cors`; dữ liệu trong bộ nhớ ở Exercise. Mongoose 8 chỉ dùng ở Homework 2.
- **Test:** Vitest + jsdom + React Testing Library (client); Vitest + supertest (server).
- **Mỗi project là độc lập** (`package.json`, `node_modules/` riêng): `Exercise_Lab04/client`, `Exercise_Lab04/server`, và từng Homework. Chạy `npm` ngay trong folder của project.
- Không dùng TanStack Query, Next.js, RSC: thuộc lab sau (Tier 3). Không state manager ngoài (Redux, Zustand).

## 3. Quy trình 4 giai đoạn [Thầy]

1. **Contract:** viết API và interface trước.
2. **Fail test:** viết test đang đỏ.
3. **Implement:** code tối thiểu cho test xanh.
4. **Refactor:** dọn code, test vẫn xanh.

**Luật:** một prompt AI = một task ID. Không dán cả đề vào làm một lần.

## 4. API bị cấm [Thầy + Lab 3]

| Cấm | Thay bằng |
|---|---|
| React Router v5: `<Switch>`, `<Redirect>`, `exact`, `component={...}`, `activeClassName` | `<Routes>`, `<Route element={...}>`, `<Navigate>`, `NavLink` với `className={({ isActive }) => ...}` |
| `import ... from 'react-router-dom'` | `import ... from 'react-router'` |
| `react-media`, `typeface-roboto`, `@material-ui/core` (v4) | CSS Grid và `@media`; `@font-face`; HTML ngữ nghĩa |
| `Component.defaultProps` | Default parameter khi destructure |
| `useEffect` để tính lỗi form hoặc state dẫn xuất | Tính ngay trong thân render |
| `useEffect` thiếu mảng dependency, hoặc tắt rule exhaustive-deps | Khai báo đủ dependency |
| Cờ `didCancel` boolean cho request bất đồng bộ | `AbortController` + `signal.aborted` |
| Chuỗi kết nối cứng trong mã (`mongodb://user:pass@...`) | `process.env.MONGODB_URI` |
| Callback Mongoose (`.exec((err, doc) => ...)`) | `async`/`await` |
| `useNewUrlParser`, `useUnifiedTopology` | `await mongoose.connect(uri)` |
| `ReactDOM.render`, `class extends Component`, `import * as React` | `createRoot`, function component, import hook tường minh |
| `keyCode`, `keypress`, `window.alert()`, `dangerouslySetInnerHTML`, `innerHTML` | `e.code`/`e.key`, `role="alert"`, JSX tự escape |
| `key={index}` | ID thực thể ổn định |
| `<button>` không `type`; icon-only button không `aria-label` | `type="button"`; thêm `aria-label` |
| URL `http://` cho tài nguyên ngoài | `https://` (localhost trong dev là ngoại lệ) |

## 5. Quy tắc theo chủ đề

### 5.1 Router [Thầy]

- Toàn bộ `<Routes>` nằm trong `App.jsx`. Layout dùng nhau qua `<Outlet/>`.
- `useParams()` luôn trả về **chuỗi**; so sánh ID cùng kiểu.
- Tra cứu không thấy thì hiện trạng thái 404 trong vùng nội dung, không ném lỗi.
- `NavLink` đánh dấu trang hiện tại bằng `aria-current` (tự động) và kiểu không chỉ dựa vào màu.
- Code splitting theo route bằng `React.lazy` + `<Suspense fallback>`; skeleton cùng kích thước nội dung thật (CLS = 0), nằm trong vùng `role="status"` có sẵn.

### 5.2 Form và Context [Thầy]

- `values`, `touched`, `submitted` là state; `errors`, `isValid` tính trong render. **Không `useEffect`** trong module form.
- Mỗi `InputField` gọi `useId()` riêng (không dùng chung một `id` từ Provider), `<label htmlFor>`, `aria-invalid`, `aria-describedby` trỏ tới phần tử lỗi.
- Luật validation là hàm thuần `(value, allValues) => string | null` để dễ thêm luật chéo trường.
- `useFormContext()` ném lỗi dễ hiểu nếu dùng ngoài Provider.

### 5.3 Dữ liệu bất đồng bộ [Thầy]

- Fetch trong `useEffect` có `new AbortController()`, `{ signal }`, cleanup `controller.abort()`.
- Kiểm `res.ok` trước khi đọc JSON. Bỏ qua `AbortError`. Mọi `setState` sau `await` phải đứng sau `if (!controller.signal.aborted)`.
- Trạng thái tải lưu theo khóa đầu vào (vd. `result.channel`) để dẫn xuất `loading`, tránh hiện dữ liệu của đầu vào cũ.
- Không `setState` đồng bộ ở đầu effect (rule `react-hooks` báo lỗi).

### 5.4 Server Express [Thầy]

- `express.json()` trước các route; middleware bắt JSON hỏng trả `400`.
- Kiểm tra payload POST ở server: kiểu, rỗng sau `trim`, độ dài tối đa. Server tự sinh `id` (`crypto.randomUUID()`) và `timestamp`.
- CORS giới hạn origin của client (`CLIENT_ORIGIN`), không dùng `*`.
- `createApp()` export riêng khỏi `listen()` để test bằng supertest.
- Bí mật chỉ đọc từ `process.env`. `.env` không commit; `.env.example` ở repo có danh sách biến, không có giá trị thật.
- Hợp đồng API nằm ở [../shared/api-contract.md](../shared/api-contract.md), viết trước khi code.

### 5.5 HTML và CSS [Thầy + Lab 3]

- Một `<main>` mỗi trang; một `<h1>`, heading không nhảy cấp. Cặp khóa-giá trị dùng `<dl>/<dt>/<dd>`; `<Fragment key>` trong `.map()`.
- CSS Modules; màu và khoảng cách là custom property ở `:root`, không hardcode hex ngoài token.
- 320px và 375px không cuộn ngang; thử đến 1440px. `:focus-visible` rõ; `prefers-reduced-motion` tắt animation.

## 6. Khả năng truy cập: WCAG 2.2 mức AA [Cá nhân, kế thừa Lab 2/3]

Áp dụng cho **mọi UI** và **mọi tài liệu**. Không tự khẳng định "đạt WCAG" khi chưa kiểm; ghi rõ tiêu chí nào, kiểm bằng cách nào.

| Tiêu chí | Quy tắc |
|---|---|
| 1.3.1 | Thẻ ngữ nghĩa, `<dl>` cho cặp khóa-giá trị |
| 1.4.1 | Không truyền thông tin chỉ bằng màu |
| 1.4.3 / 1.4.11 | Tương phản chữ 4.5:1; viền control 3:1 |
| 2.1.1 / 2.4.7 | Mọi chức năng dùng được bằng bàn phím; thấy rõ focus |
| 2.5.8 | Vùng bấm tối thiểu 24×24 CSS px |
| 3.3.2 | Mỗi control có nhãn hiển thị |
| 4.1.2 | Control có tên truy cập; icon-only button có `aria-label` |
| 4.1.3 | `role="status"` cho trạng thái tải; `role="alert"` cho lỗi chặn |

Tài liệu Markdown: một H1 mỗi file, heading liên tục, link có mô tả, bảng có hàng tiêu đề, code block ghi ngôn ngữ, không dùng emoji để mang nghĩa.

## 7. Git [Thầy + Lab 3]

- **AI được commit cục bộ, không push, không thêm dòng `Co-Authored-By`** (người dùng tự thêm co-author). Chỉ `git add` đúng file của task, xem `git diff --staged` trước khi commit.
- Conventional Commits: `type(scope): message`; types `feat`, `fix`, `style`, `refactor`, `test`, `docs`, `chore`, `perf`.
- Message chốt sẵn trong đề dùng nguyên văn: `feat: router layout`, `feat: detail route handling`, `feat: form context`, `feat: input field validation`, `feat: inspector output`.
- Spec trước code: commit tài liệu đi trước commit code. Mỗi commit atomic, `git log --oneline --graph` đọc được ngay.
- Không `--force`, `--no-verify`. Không commit `node_modules/`, `dist/`, `.env`.

## 8. Bảo vệ trực tiếp (3 phút) [Thầy]

- **Tắt hết AI.** Quy trình: kiểm `git log` và WBS → kiểm DevTools → sửa một yêu cầu bị đổi (đồng bộ state với URL, validation chéo, tự thử lại với backoff, route guard).
- Mỗi quyết định kiến trúc nằm ở **một chỗ**: toàn bộ route ở `App.jsx`, toàn bộ luật ở `rules.js`, mọi `fetch` của forum ở một hàm trong hook.
- Không giữ đoạn mã mình không giải thích được.

## 9. Định nghĩa "Xong" cho mỗi sub-task

- [ ] Khớp contract trong WBS.
- [ ] Test của task pass (dán output thật).
- [ ] `npm run lint` sạch; Console không warning (kể cả key warning và StrictMode).
- [ ] Grep sạch các API bị cấm ở mục 4.
- [ ] 320px không cuộn ngang; thao tác được bằng bàn phím.
- [ ] Bằng chứng DevTools lưu ở `evidence/` nếu task liên quan.
- [ ] Prompt log lưu ở `docs/prompt_logs/`; lỗi AI gặp được ghi chú cho `AI_FAILURE_AUDIT.md`.
- [ ] Đề xuất commit atomic với message đã định.

## 10. Quy tắc cá nhân [Cá nhân]

- Tiếng Việt cho tài liệu và câu trả lời; thuật ngữ kỹ thuật giữ tiếng Anh.
- Tận dụng mã Lab03 bằng cách **sao chép** (ghi chú nguồn ở đầu file), không import chéo giữa hai repo.
