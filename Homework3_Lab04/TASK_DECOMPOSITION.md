# TASK_DECOMPOSITION: Homework 3, Photo & Evidence Gallery

> WBS con của [TASK_DECOMPOSITION.md](../TASK_DECOMPOSITION.md). Luật: [project-rules.md](../project-rules.md), [Agents.md](../Agents.md). Đề: slide 19 và slide 30 trong [Context.md](../docs/Context.md).
> **Cho agent thực thi:** dùng superpowers:executing-plans hoặc superpowers:subagent-driven-development. Mỗi lượt làm đúng một task ID. Chỉ tick `- [ ]` khi đã chạy lệnh kiểm chứng và thấy output thật.
> Project nằm ở `client/` (không có server). Chạy `npm` ngay trong folder đó, và **`cd` bằng đường dẫn ổ chữ hoa `C:/...`** trước khi chạy Vitest. Mọi đường dẫn bên dưới tính từ `Homework3_Lab04/`.

**Mục tiêu:** SPA thư viện ảnh nhiều route, làm đủ 3 yêu cầu kỹ thuật của slide 19 và để nội dung ở mức tối thiểu:
1. Deep linking bằng `useSearchParams()` cho bộ lọc danh mục và ảnh đang mở trong lightbox.
2. Lightbox dùng phần tử `<dialog>` gốc của HTML.
3. WCAG 2.2 AA và Lighthouse 100/100.

**Kiến trúc:**
- Không có server. State của gallery nằm hoàn toàn trong URL (`?category=&photoId=`); danh sách ảnh đang hiện và ảnh đang mở đều dẫn xuất trong render.
- Ảnh là SVG do script `scripts/generate-photos.mjs` sinh một lần từ `src/data/photos.js` rồi commit vào `public/photos/`. Người dùng đã chọn phương án này ngày 2026-11-26: không dính bản quyền, không giả làm bằng chứng thật, nhẹ nên dễ đạt 100.
- `PhotoLightbox` là nơi duy nhất có `useEffect`: đồng bộ `dialog.showModal()` và `close()` với URL (đồng bộ với DOM bên ngoài React). `<dialog>` gốc lo focus trap, `Esc`, và làm phần còn lại của trang trơ (inert).

**Stack:** React ^19.3, react-router ^7.18, Vite ^8, Vitest ^5 + jsdom + React Testing Library + user-event, ESLint 9 (cấu hình chép từ HW2), axe-core (test a11y trong jsdom), Lighthouse CLI + puppeteer-core trên Edge (kiểm chứng).

**Không làm:** server, DB, upload ảnh, tìm kiếm, phân trang, ảnh thật.

## 1. Hợp đồng URL (viết trước code, H3-00)

| Tham số | Giá trị hợp lệ | Hành vi |
|---|---|---|
| `category` | `all` (mặc định, có thể vắng), `scene`, `document`, `chart` | Giá trị lạ, rỗng hoặc vắng thì coi là `all`, không lỗi, không sửa URL |
| `photoId` | id có trong `PHOTOS` (`p01` đến `p12`) | Có thì mở lightbox. Id không tồn tại thì không mở, hiện thông báo trong vùng nội dung |

| Route | Trang |
|---|---|
| `/` | Gallery (eager, vì là trang chủ và là LCP) |
| `/about` | Giải thích dữ liệu, tham số URL và cam kết truy cập (lazy + `Suspense`) |
| `*` | 404 trong vùng nội dung |

Quy ước lịch sử trình duyệt:
- Mở ảnh từ lưới = **push** (nút Back đóng lightbox).
- Chuyển ảnh trước/sau = **replace** (Back không đi lần lượt qua từng ảnh).
- Đóng lightbox = **replace**, chỉ xóa `photoId`, **giữ** `category` và mọi tham số khác.
- Đổi danh mục = **push**, đồng thời xóa `photoId`.

## 2. Ràng buộc chung

- **Cổng:** client `5176` (`strictPort`).
- **Nội dung:** 12 ảnh `p01` đến `p12`, 3 danh mục × 4 ảnh (`p01-p04` scene, `p05-p08` document, `p09-p12` chart). Mọi ảnh là ảnh minh họa tự sinh; header và `/about` ghi rõ điều đó.
- **Cấm** (grep phải ra 0 dòng trong `client/src`):
  - `react-router-dom|keyCode|defaultProps|dangerouslySetInnerHTML|alert\(`
  - `useEffect` ở mọi file **ngoài** `components/PhotoLightbox.jsx` (đúng 1 file có chữ này)
  - `useState` trong `pages/GalleryPage.jsx` (state nằm ở URL)
- **Ảnh:** mọi `<img>` có `width`, `height`, `alt`. Ảnh trong lưới là trang trí (`alt=""`, tên nằm ở chữ hiển thị của link). Ảnh trong lightbox có `alt` mô tả. Chỉ 4 ảnh đầu `loading="eager"`, ảnh đầu thêm `fetchpriority="high"`, còn lại `loading="lazy"`. CSS `aspect-ratio: 3 / 2`.
- **WCAG 2.2 AA:** theo bảng §6 của [project-rules.md](../project-rules.md), cộng: bỏ qua khối (2.4.1: link "Bỏ qua tới nội dung"), vùng bấm ≥ 24×24 (2.5.8), focus không bị che (2.4.11), reflow ở 320px (1.4.10), `prefers-reduced-motion` tắt animation.
- **UI:** mọi `<button>` có `type`. Danh sách dùng `key` là id ảnh. Một `<main>` và một `<h1>` mỗi trang.
- **Commit:** Conventional Commits, scope `hw3` hoặc `hw3-client`. Chỉ `git add` file của task, không push, không thêm dòng `Co-Authored-By` (người dùng tự thêm).

## 3. Điểm cần soi kỹ

Những tình huống slide không nói tới nhưng dễ hỏng khi dùng thật.

| # | Tình huống | Hành vi mong đợi | Test nằm ở |
|---|---|---|---|
| R1 | Nút Back khi lightbox đang mở | Lightbox đóng, danh mục giữ nguyên | H3-06 |
| R2 | `Esc` hoặc nút Đóng hoặc bấm nền tối | Chỉ `photoId` biến khỏi URL, `category` còn nguyên (mẫu slide `setSearchParams({})` xóa hết) | H3-05, H3-06 |
| R3 | `photoId` không tồn tại, hoặc `photoId` có thật nhưng thuộc danh mục khác với `category` đang lọc | Id lạ: không mở modal rỗng, hiện thông báo kèm link "Xem toàn bộ ảnh". Id thuộc danh mục khác: vẫn mở, không có nút trước/sau | H3-06 |
| R4 | `?category=xyz`, `?category=`, `?category=constructor`, tham số lặp | Coi là `all`, không lỗi | H3-03, H3-06 |
| R5 | Effect chạy hai lần (StrictMode) hoặc `showModal()` khi dialog đã mở | Không ném `InvalidStateError` | H3-05 |
| R6 | Đóng lightbox | Focus về đúng thumbnail đã bấm; cuộn trang không bị khóa ngầm; khi đang mở thì nền không cuộn được | H3-08 (Edge) |
| R7 | Ở ảnh đầu hoặc cuối của danh sách | Nút trước/sau tương ứng là `aria-disabled`, focus không mất | H3-05 |

## 4. Cấu trúc file

```text
Homework3_Lab04/
  README.md
  evidence/
  client/
    package.json  vite.config.js  eslint.config.js  index.html
    scripts/generate-photos.mjs     sinh public/photos/*.svg từ src/data/photos.js
    public/photos/p01.svg … p12.svg  robots.txt
    src/
      main.jsx  App.jsx
      styles/tokens.css
      data/photos.js                CATEGORIES, PHOTOS
      domain/gallery.js             parseCategory, filterPhotos, findPhoto, neighbors, withParams
      hooks/useGalleryParams.js
      components/Layout.jsx  PhotoLightbox.jsx  (+ .module.css)
      pages/GalleryPage.jsx  AboutPage.jsx  NotFound.jsx  (+ .module.css)
      test/setup.js                 jest-dom + polyfill <dialog> cho jsdom
      *.test.js(x)                  cạnh file nguồn
```

## 5. Bảng task

| ID | Task | Gate | Trạng thái |
|---|---|---|---|
| H3-00 | Hợp đồng URL + kiểu dữ liệu | File contract được commit trước code | [x] |
| H3-01 | Khung client + router + khung Layout | `npm test`, `lint`, `build` chạy; test route + 404 xanh | [x] |
| H3-02 | Dữ liệu ảnh + script sinh SVG | Test dữ liệu xanh, 12 file SVG tồn tại | [x] |
| H3-03 | Hàm thuần của gallery | Test R4 phía domain xanh | [x] |
| H3-04 | Hook `useGalleryParams` | Test giữ tham số xanh | [x] |
| H3-05 | `PhotoLightbox` bằng `<dialog>` | Test R2, R5, R7 xanh | [x] |
| H3-06 | Trang Gallery: lưới, lọc, deep link | Test R1, R2, R3, R4 xanh | [x] |
| H3-07 | CSS, trang About, README | 320px không cuộn ngang | [x] |
| H3-08 | Kiểm chứng: axe, Lighthouse, Edge | Lighthouse 100, e2e R6 đạt, ảnh trong `evidence/` | [x] |

---

## 6. Chi tiết task

### H3-00: Hợp đồng URL + kiểu dữ liệu

**Files:** tạo `../shared/gallery-url-contract.md`.

- [ ] **Bước 1:** chép bảng §1 của file này, thêm typedef:

```js
/** @typedef {'all'|'scene'|'document'|'chart'} CategorySlug */
/** @typedef {{ slug: CategorySlug, label: string }} Category */
/** @typedef {{ id: string, category: Exclude<CategorySlug, 'all'>, title: string, alt: string, caption: string, src: string, width: 600, height: 400 }} Photo */
```

- [ ] **Bước 2:** commit `docs(hw3): add gallery url contract`.

### H3-01: Khung client + router + Layout

**Files:** tạo `client/package.json`, `vite.config.js`, `eslint.config.js`, `index.html`, `public/robots.txt`, `src/main.jsx`, `src/App.jsx`, `src/styles/tokens.css`, `src/components/Layout.jsx` (+ css), `src/pages/NotFound.jsx`, `src/pages/AboutPage.jsx` (tạm một `h2`), `src/pages/GalleryPage.jsx` (tạm một `h2`), `src/test/setup.js`, `src/App.test.jsx`.

**Interfaces:**
- **Produces:** `App()` chứa toàn bộ `<Routes>`; `Layout()` có skip link, `h1`, `NavLink` tới `/` (có `end`) và `/about`, `<main id="main">`, `<Outlet/>`; `NotFound({ title? })`.

- [ ] **Bước 1:** chép `package.json`, `eslint.config.js`, `tokens.css` từ `../Homework2_Lab04/client/`. Đổi tên package thành `msis207-lab04-hw3-client`. Thêm `axe-core` vào devDependencies. `vite.config.js`: như HW2 nhưng `port: 5176`, bỏ `fs.allow`, bỏ `envDir`. `index.html`: `lang="vi"`, `<title>Photo & Evidence Gallery</title>`, meta description một câu, `<link rel="icon" href="data:," />`. `robots.txt`: `User-agent: *` rồi `Allow: /`. Cài bằng `npm install </dev/null`.
- [ ] **Bước 2:** `src/test/setup.js`: `@testing-library/jest-dom/vitest`, `cleanup` sau mỗi test, và polyfill `<dialog>` cho jsdom khi `HTMLDialogElement.prototype.showModal` chưa có:
  - `showModal()`: ném `InvalidStateError` nếu đã `open` (đúng hành vi trình duyệt, để test R5 có ý nghĩa), không thì `setAttribute('open', '')`.
  - `close()`: nếu đang `open` thì bỏ thuộc tính `open` rồi `dispatchEvent(new Event('close'))`; nếu không thì không làm gì.
- [ ] **Bước 3:** viết test đỏ `App.test.jsx` (`MemoryRouter`):
  - Mỗi route có đúng một `h1` `'Photo & Evidence Gallery'` và đúng một `<main>`.
  - Có link `'Bỏ qua tới nội dung'` trỏ `#main`.
  - Dòng ghi chú `'Mọi ảnh là ảnh minh họa tự sinh cho bài tập MSIS207, không phải bằng chứng thật.'` có mặt.
  - `/about` hiện heading `'Giới thiệu'` sau khi trang lazy tải xong.
  - `/khong-co` hiện heading `'Không tìm thấy trang'` và link `'Về thư viện ảnh'` có `href="/"`.
- [ ] **Bước 4:** `npm test` → FAIL. Cài cho xanh: `AboutPage` `React.lazy` bọc `<Suspense fallback={<p role="status">Đang tải…</p>}>`, `GalleryPage` import thường. Import router từ `'react-router'`. `main.jsx` bọc `StrictMode` và `BrowserRouter`.
- [ ] **Bước 5:** `npm test`, `npm run lint`, `npm run build` đều chạy được. Commit `feat(hw3-client): scaffold gallery client with router shell`.

### H3-02: Dữ liệu ảnh + script sinh SVG

**Files:** tạo `client/src/data/photos.js`, `client/src/data/photos.test.js`, `client/scripts/generate-photos.mjs`, và 12 file `client/public/photos/p01.svg` … `p12.svg` (do script sinh).

**Interfaces:**
- **Produces:**
  - `CATEGORIES: readonly Category[]` đúng thứ tự `all` ('Tất cả'), `scene` ('Hiện trường'), `document` ('Tài liệu'), `chart` ('Biểu đồ').
  - `PHOTOS: readonly Photo[]` (12 phần tử, `src = '/photos/<id>.svg'`, `width 600`, `height 400`).

- [ ] **Bước 1:** viết test đỏ `photos.test.js` (chạy trong jsdom nhưng dùng `node:fs` để kiểm file):
  - `PHOTOS.length === 12`, id duy nhất, id khớp `/^p\d{2}$/`.
  - Mỗi danh mục thật có đúng 4 ảnh; `category` của mỗi ảnh nằm trong `CATEGORIES`.
  - `title`, `caption` không rỗng; `alt` dài ≥ 20 ký tự; `alt` mỗi ảnh khác nhau.
  - Mỗi `src` có file tương ứng trong `public/photos/` (`existsSync`).
- [ ] **Bước 2:** `npm test` → FAIL.
- [ ] **Bước 3:** viết `photos.js` (tiêu đề và `alt` tiếng Việt, ghi rõ là minh họa, ví dụ `'Hiện trường 1: phòng thi đấu (minh họa)'`). Viết `generate-photos.mjs` import `PHOTOS` từ `../src/data/photos.js` và ghi mỗi ảnh một SVG `viewBox="0 0 600 400"`: nền gradient theo danh mục (scene tông xanh dương, document tông xanh lá, chart tông cam), vài hình khối khác nhau theo chỉ số ảnh, một dòng chữ `Ảnh minh họa p01`. Mỗi file dưới 2KB. Thêm script `"photos": "node scripts/generate-photos.mjs"`.
- [ ] **Bước 4:** `npm run photos`, rồi `npm test` → PASS. Commit cả 12 SVG: `feat(hw3-client): photo data and generated placeholder svgs`.

### H3-03: Hàm thuần của gallery

**Files:** tạo `client/src/domain/gallery.js` và `gallery.test.js`.

**Interfaces:**
- **Consumes:** `CATEGORIES`, `PHOTOS` từ `data/photos.js`.
- **Produces:**
  - `parseCategory(raw: string | null): CategorySlug`: trả `raw` nếu là slug trong `CATEGORIES`, ngược lại `'all'`.
  - `filterPhotos(photos: Photo[], category: CategorySlug): Photo[]`
  - `findPhoto(photos: Photo[], id: string | null): Photo | null`
  - `neighbors(list: Photo[], id: string): { prev: Photo|null, next: Photo|null, index: number, total: number }`. `id` không có trong `list` thì `index: -1`, `prev` và `next` là `null`.
  - `withParams(current: URLSearchParams, patch: Record<string, string | null>): URLSearchParams`: bản sao có áp patch (`null` xóa khóa), không đụng `current`, giữ mọi khóa khác.

- [ ] **Bước 1:** viết test đỏ:

```js
it('parseCategory chỉ nhận slug hợp lệ (R4)', () => {
  expect(parseCategory('document')).toBe('document');
  for (const bad of ['xyz', '', null, 'constructor', '__proto__', 'Scene']) expect(parseCategory(bad)).toBe('all');
});
it('filterPhotos', () => {
  expect(filterPhotos(PHOTOS, 'all')).toHaveLength(12);
  const scene = filterPhotos(PHOTOS, 'scene');
  expect(scene).toHaveLength(4);
  expect(scene.every((p) => p.category === 'scene')).toBe(true);
});
it('findPhoto: id lạ, null và khóa nguyên mẫu đều trả null', () => {
  expect(findPhoto(PHOTOS, 'p01').id).toBe('p01');
  for (const bad of ['zz', null, 'constructor']) expect(findPhoto(PHOTOS, bad)).toBeNull();
});
it('neighbors giữa, đầu, cuối, vắng mặt (R7)', () => {
  const list = PHOTOS.slice(0, 3);
  expect(neighbors(list, 'p02')).toMatchObject({ index: 1, total: 3, prev: { id: 'p01' }, next: { id: 'p03' } });
  expect(neighbors(list, 'p01')).toMatchObject({ prev: null, next: { id: 'p02' } });
  expect(neighbors(list, 'p03')).toMatchObject({ prev: { id: 'p02' }, next: null });
  expect(neighbors(list, 'p09')).toEqual({ prev: null, next: null, index: -1, total: 3 });
});
it('withParams áp patch, xóa khi null, giữ khóa khác, không đổi input', () => {
  const current = new URLSearchParams('category=chart&photoId=p09&utm=1');
  const next = withParams(current, { photoId: null });
  expect(Object.fromEntries(next)).toEqual({ category: 'chart', utm: '1' });
  expect(Object.fromEntries(withParams(current, { category: 'scene', photoId: 'p01' }))).toEqual({ category: 'scene', photoId: 'p01', utm: '1' });
  expect(current.toString()).toBe('category=chart&photoId=p09&utm=1');
});
```

- [ ] **Bước 2:** `npm test` → FAIL; cài cho xanh (dùng `Object.hasOwn` hoặc `CATEGORIES.some`, không tra bằng `obj[key]`). Commit `feat(hw3-client): pure gallery filter and url helpers`.

### H3-04: Hook `useGalleryParams`

**Files:** tạo `client/src/hooks/useGalleryParams.js` và `useGalleryParams.test.jsx`.

**Interfaces:**
- **Consumes:** `parseCategory`, `withParams`; `useSearchParams` từ `'react-router'`.
- **Produces:** `useGalleryParams() → { category: CategorySlug, photoId: string | null, searchFor(patch: Record<string, string|null>): string, selectCategory(slug: CategorySlug): void, closePhoto(): void }`.
  - `searchFor` trả chuỗi query bắt đầu bằng `?` (hoặc `''` khi rỗng), dùng cho `<Link to={{ search }}>`.
  - `selectCategory(slug)`: đặt `category` (xóa khóa nếu `all`) **và xóa `photoId`**, **push**.
  - `closePhoto()`: xóa riêng `photoId`, **replace**; không làm gì nếu không có `photoId`.

- [ ] **Bước 1:** viết test đỏ, bọc `MemoryRouter initialEntries={['/?category=chart&photoId=p09&utm=1']}`:
  - `category === 'chart'`, `photoId === 'p09'`.
  - `closePhoto()` → URL là `?category=chart&utm=1` (R2), và lịch sử không dài thêm (replace).
  - `selectCategory('scene')` → `category=scene&utm=1`, không còn `photoId`.
  - `selectCategory('all')` → không còn khóa `category`.
  - `searchFor({ photoId: 'p10' })` giữ `category=chart` và `utm=1`.
  - Không có `photoId` thì `closePhoto()` không đổi URL.
  - `?category=xyz` → `category === 'all'` (R4).
- [ ] **Bước 2:** `npm test` → FAIL; cài cho xanh bằng `useSearchParams` và `setSearchParams(next, { replace })`. Commit `feat(hw3-client): url-backed gallery params hook`.

### H3-05: `PhotoLightbox` bằng `<dialog>`

**Files:** tạo `client/src/components/PhotoLightbox.jsx`, `PhotoLightbox.module.css`, `PhotoLightbox.test.jsx`.

**Interfaces:**
- **Consumes:** kiểu `Photo`.
- **Produces:** `PhotoLightbox({ photo, prev, next, position, hrefFor, onClose })`:
  - `photo: Photo | null` (null thì dialog đóng); `prev`, `next: Photo | null`; `position: { index: number, total: number }`; `hrefFor(id: string): string` (query của ảnh đó, dùng cho nút chuyển ảnh); `onClose(): void`.
  - Luôn render `<dialog>` (để có ref), chỉ render nội dung khi `photo` khác null. Dialog có `aria-labelledby` trỏ tiêu đề (`useId()`).
  - Thứ tự DOM: nút `Đóng` đầu tiên (nhận focus khi `showModal()`), rồi `figure` (`img` với `alt` đầy đủ, `figcaption`), rồi chữ vị trí `Ảnh 2/4`, rồi nút `Ảnh trước` và `Ảnh sau`.
  - Nút trước/sau là `<button type="button">` có `aria-disabled="true"` khi `prev`/`next` là null (không dùng `disabled`, để focus không rơi mất, R7); bấm khi `aria-disabled` thì không làm gì. Điều hướng bằng `useNavigate` với `{ replace: true }`.
  - Bấm vào chính phần tử `<dialog>` (nền tối, `event.target === event.currentTarget`) gọi `onClose`.

- [ ] **Bước 1:** viết test đỏ (trong `MemoryRouter`, dùng polyfill của H3-01):
  - `photo` có giá trị thì `dialog` có `open`; chuyển `photo={null}` thì đóng.
  - Dialog có tên truy cập là tiêu đề ảnh; `img` có `alt` của ảnh.
  - Nút `Đóng` là phần tử đầu tiên có thể focus trong dialog.
  - Bấm `Đóng` → `onClose` được gọi đúng 1 lần.
  - Mô phỏng `Esc`: `dialog.close()` (polyfill bắn `close`) → `onClose` gọi 1 lần (R2).
  - Đóng do `photo` chuyển sang `null` **không** gọi `onClose` (tránh vòng lặp với URL).
  - Bấm nền tối (`user.click(dialog)`) gọi `onClose`; bấm vào `img` thì không.
  - R5: render dưới `StrictMode` không ném lỗi; render hai lần liên tiếp với cùng `photo` không ném `InvalidStateError`.
  - R7: ảnh đầu (`prev=null`): nút `Ảnh trước` có `aria-disabled="true"`, bấm không đổi URL; ảnh cuối tương tự với `Ảnh sau`. `position` hiện `Ảnh 1/4`.
- [ ] **Bước 2:** `npm test` → FAIL.
- [ ] **Bước 3:** cài đặt. Một `useEffect` phụ thuộc `[open]` (`open = photo !== null`): `if (open && !dialog.open) dialog.showModal(); if (!open && dialog.open) dialog.close();`. Gắn `onClose` của React vào sự kiện `close` của dialog, chỉ gọi prop `onClose` khi `photo !== null`. Bắt thêm sự kiện `cancel` (`Esc`) không cần xử lý riêng vì `close` sẽ tới.
- [ ] **Bước 4:** `npm test` xanh, `npm run lint` sạch. Commit `feat(hw3-client): native dialog photo lightbox`.

### H3-06: Trang Gallery: lưới, lọc, deep link

**Files:** thay `client/src/pages/GalleryPage.jsx` (+ `.module.css`), tạo `GalleryPage.test.jsx`.

**Interfaces:**
- **Consumes:** `PHOTOS`, `CATEGORIES`, `filterPhotos`, `findPhoto`, `neighbors`, `useGalleryParams`, `PhotoLightbox`.
- **Produces:** `GalleryPage()`. Dẫn xuất trong render, **không `useState`**:
  - `visible = filterPhotos(PHOTOS, category)`; `photo = findPhoto(PHOTOS, photoId)`.
  - `nav = photo ? neighbors(visible, photo.id) : null`. Ảnh nằm ngoài `visible` thì `prev` và `next` đều null, `position` ẩn.
  - Khi `photoId` có giá trị nhưng `photo` là null: hiện `<p role="status">Không tìm thấy ảnh "<photoId>".</p>` kèm `<Link>` `'Xem toàn bộ ảnh'` về `?` (xóa `photoId`), và `PhotoLightbox photo={null}`.
- **Bố cục:** `h2` `'Thư viện ảnh'`; `<nav aria-label="Lọc theo danh mục">` gồm `<Link>` từng danh mục, danh mục đang chọn có `aria-current="true"` (và kiểu đậm/gạch chân, không chỉ dựa vào màu); `<p role="status">` `'Hiển thị 4 ảnh, danh mục Hiện trường'`; lưới `<ul>` mỗi ảnh một `<li><Link to={{ search: searchFor({ photoId: id }) }}>` chứa `<img alt="">` và tên ảnh hiển thị.

- [ ] **Bước 1:** viết test đỏ (`MemoryRouter`; một test dùng `useNavigate` lấy ra để gọi `navigate(-1)`, như `AppealForm.test.jsx` ở HW2):
  - Vào `/`: 12 link ảnh; link `Tất cả` có `aria-current="true"`; status ghi `Hiển thị 12 ảnh`.
  - Vào `/?category=document`: 4 ảnh toàn `p05`–`p08`; các link ảnh có `href` giữ `category=document`.
  - R4: `/?category=xyz` hiện 12 ảnh, không lỗi.
  - Deep link `/?category=document&photoId=p06`: `dialog` đang mở, hiện tiêu đề của `p06`, vị trí `Ảnh 2/4`.
  - Bấm một thumbnail từ `/?category=scene`: dialog mở, URL có `category=scene&photoId=<id>`.
  - R2: bấm `Đóng` rồi kiểm URL còn `category=scene`, không còn `photoId`, dialog đóng.
  - R1: mở ảnh bằng click rồi `act(() => navigate(-1))` → dialog đóng, danh mục giữ nguyên.
  - Bấm `Ảnh sau` đổi sang ảnh kế và dùng replace: `navigate(-1)` sau đó đưa về trang lưới, không đi qua ảnh trước.
  - R3a: `/?photoId=zz` hiện `role="status"` `Không tìm thấy ảnh "zz".`, dialog không mở, có link `Xem toàn bộ ảnh`.
  - R3b: `/?category=scene&photoId=p06` (p06 thuộc document): dialog mở với `p06`, nút `Ảnh trước` và `Ảnh sau` đều `aria-disabled`, không có chữ vị trí.
  - Mọi link lọc danh mục có `href` không chứa `photoId`, kể cả khi đang mở ảnh.
  - 4 `img` đầu có `loading="eager"`, ảnh đầu có `fetchpriority="high"`, các ảnh còn lại `loading="lazy"`; mọi `img` có `width` và `height`.
- [ ] **Bước 2:** `npm test` → FAIL.
- [ ] **Bước 3:** cài đặt cho xanh. Link lọc dùng `searchFor({ category: slug === 'all' ? null : slug, photoId: null })`. `onClose` truyền `closePhoto`. `hrefFor` truyền cho lightbox là `(id) => searchFor({ photoId: id })`.
- [ ] **Bước 4:** `grep useState src/pages/GalleryPage.jsx` ra 0 dòng; `npm run lint`. Commit `feat(hw3-client): url-driven gallery page with deep-linked lightbox`.

### H3-07: CSS, trang About, README

**Files:** tạo/sửa `client/src/pages/AboutPage.jsx`, các file `.module.css`, `README.md`.

- [ ] **Bước 1:** CSS:
  - Lưới `grid-template-columns: repeat(auto-fill, minmax(min(100%, 12rem), 1fr))`.
  - `img { width: 100%; height: auto; aspect-ratio: 3 / 2 }`.
  - `:focus-visible` dày 3px.
  - `prefers-reduced-motion: reduce` tắt mọi transition.
  - Link và nút cao ≥ 44px.
  - Tương phản chữ ≥ 4.5:1 ở cả hai theme.
  - Dialog: `max-width: min(92vw, 56rem)`, `max-height: 92dvh`, `overflow: auto`, `::backdrop` bán trong suốt.
  - **Khóa cuộn nền khi mở dialog** (Chrome không tự khóa): `body:has(dialog[open]) { overflow: hidden; }`.
  - 320px không cuộn ngang.
- [ ] **Bước 2:** `AboutPage`: `h2` `'Giới thiệu'`; đoạn ngắn nói mọi ảnh là minh họa tự sinh; `<dl>` giải thích `category` và `photoId` (hai khóa, giá trị hợp lệ); đoạn cam kết truy cập nêu đúng những gì đã kiểm (xem H3-08) và những gì chưa kiểm (NVDA, thiết bị thật).
- [ ] **Bước 3:** `README.md`: cách chạy (`cd client && npm install && npm run dev`, mở `http://localhost:5176`), bảng tham số URL, ví dụ link `http://localhost:5176/?category=document&photoId=p06`, cách tái tạo ảnh (`npm run photos`), lệnh test, lệnh Lighthouse.
- [ ] **Bước 4:** `npm test`, `lint`, `build` chạy được. Commit `style(hw3-client): responsive layout, scroll lock and about page` rồi `docs(hw3): readme`.

### H3-08: Kiểm chứng: axe, Lighthouse, Edge

**Files:** tạo `client/src/a11y.test.jsx`; `evidence/` (báo cáo Lighthouse, `e2e-edge.json`, ảnh).

- [ ] **Bước 1:** `a11y.test.jsx`: chạy `axe-core` trên `/`, `/?category=scene`, `/?category=document&photoId=p06` (dialog mở), `/about`, `/khong-co`; tắt rule `color-contrast` (jsdom không tính được); kỳ vọng `violations` rỗng. Chạy `npm test` → xanh.
- [ ] **Bước 2:** `npm run build`, rồi `vite preview` ở `5176`. Chạy Lighthouse CLI trên Edge cho `/` và `/?category=document&photoId=p06`, mobile và desktop. Lưu `evidence/lighthouse-hw3-*.report.{html,json}`. **Mục tiêu 100 ở cả 4 hạng mục.** Nếu Performance dưới 100: tìm nguyên nhân (LCP, CLS, kích thước ảnh), sửa, đo lại; ghi số thật vào §7, không làm tròn.
- [ ] **Bước 3:** script puppeteer-core chạy trên Edge, ghi `evidence/e2e-edge.json`:
  - Deep link `/?category=document&photoId=p06` mở dialog, `document.activeElement` là nút `Đóng`.
  - `Esc` đóng dialog; URL còn `category=document`.
  - Click một thumbnail → mở; `Esc` → **focus quay về đúng thumbnail đó** (R6).
  - Khi dialog mở: `getComputedStyle(document.body).overflow === 'hidden'`; đóng thì hết.
  - Nút Back khi dialog mở đóng dialog và giữ danh mục (R1).
  - Chỉ dùng bàn phím: `Tab` tới thumbnail, `Enter` mở, `Tab` trong dialog không thoát ra ngoài, `Esc` đóng.
  - `photoId=zz` hiện thông báo, không có dialog mở.
  - 320px: `document.documentElement.scrollWidth <= clientWidth`.
  - Không có lỗi console.
  - Ảnh chụp: lưới 1280px, lưới 375px, lightbox mở 375px, lightbox mở 320px.
- [ ] **Bước 4:** chạy toàn bộ `npm test`, `lint`, `build` và các grep cấm ở §2; ghi kết quả vào §7. Cập nhật trạng thái HW3 ở `../TASK_DECOMPOSITION.md`. Commit `docs(hw3): verification evidence and results`.

## 7. Kết quả kiểm chứng

Ghi output thật vào đây khi làm xong từng gate.

Đo ngày 2026-11-26 trên máy phát triển (Node 26, Edge headless, Lighthouse 13.6.0, bản build qua `vite preview` cổng 5176).

| Hạng mục | Kết quả |
|---|---|
| `npm test` (client) | 51/51 (domain 5, dữ liệu 5, hook 6, lightbox 12, trang Gallery 13, App 4, axe 6) |
| `npm run lint` | 0 lỗi |
| `npm run build` | chạy được; `AboutPage` tách chunk riêng |
| Grep cấm (§2) | 0 dòng: `react-router-dom\|keyCode\|defaultProps\|dangerouslySetInnerHTML\|alert\(`; `useEffect` chỉ có trong `PhotoLightbox.jsx`; `GalleryPage.jsx` không có `useState` |
| axe-core trong jsdom | 0 vi phạm ở 6 trạng thái (`/`, `/?category=scene`, deep link mở ảnh, `photoId` lạ, `/about`, 404); đã tắt rule `color-contrast` vì jsdom không tính được |
| E2E trên Edge headless | 22/22, xem [evidence/e2e-edge.json](evidence/e2e-edge.json) và 5 ảnh `evidence/0*.png` |
| Review cả nhánh (subagent) | 5 phát hiện: 2 sửa (test đỏ rồi xanh), 3 Minor để lại; 1 phát hiện về lời khẳng định quá mức đã sửa bằng cách thu hẹp câu chữ |

**Lighthouse** (4 hạng mục chuẩn; báo cáo trong `evidence/lighthouse-hw3-*`):

| Trang | Chế độ | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|---|
| `/` | Mobile | 100 | 100 | 100 | 100 | 1.7 s | 0 |
| `/?category=document&photoId=p06` | Mobile | 100 | 100 | 100 | 100 | 1.5 s | 0 |
| `/` | Desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 |
| `/?category=document&photoId=p06` | Desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 |

Lighthouse 13.6.0 có thêm hạng mục mới `agentic-browsing`, cả 4 lần đo đều ra 50. Hạng mục này không thuộc 4 hạng mục chuẩn của đề và mình không xử lý.

**Đã kiểm bằng E2E trên Edge** (những thứ jsdom không làm được): deep link mở dialog và focus rơi vào nút `Đóng`; Tab không bao giờ rơi vào control nền; `Esc` đóng và giữ `category`; focus quay về đúng thumbnail đã bấm (R6); nền bị khóa cuộn khi mở và hết khóa khi đóng; Back đóng lightbox và giữ danh mục (R1); `Ảnh sau` dùng replace nên một lần Back về thẳng lưới; `photoId` lạ hiện thông báo; `category` lạ hiện đủ 12 ảnh; 320px không cuộn ngang, kể cả khi lightbox đang mở.

**Phát hiện của review đã sửa:**
- Người dùng đọc màn hình không được báo khi đổi ảnh bằng nút Ảnh trước/sau (focus ở nguyên nút). Giờ chữ vị trí nằm trong `role="status"` và kèm tiêu đề ảnh.
- Sự kiện `close` của dialog có thể đến muộn khi Back rồi Forward nhanh, làm mất `photoId` vừa mở lại. Giờ bỏ qua sự kiện đó nếu dialog đã mở lại.
- Trang giới thiệu khẳng định "dùng được hoàn toàn bằng bàn phím" nhiều hơn bằng chứng. Đã thu hẹp lại đúng phần đã kiểm và liệt kê phần chưa kiểm.

**Phát hiện Minor để lại (chưa sửa):**
- Bấm nền tối để đóng có thể kích hoạt nhầm khi kéo chuột từ trong dialog ra ngoài, hoặc khi bấm vào thanh cuộn của dialog.
- Chuyển ảnh bằng nút rồi `Esc`: focus quay về ảnh đã bấm ban đầu, không phải ảnh đang xem lúc đóng. Vẫn hợp lệ theo WCAG 2.4.3.
- Mở bằng deep link rồi đóng thì focus về `<body>` (không có thumbnail nào đã được bấm).

## 8. Còn lại cho người dùng

- Nghe thử lightbox bằng NVDA hoặc Narrator: dialog có được đọc tên, focus có vào nút `Đóng`, thông báo `Hiển thị N ảnh` có được đọc khi đổi danh mục.
- Thử trên thiết bị cảm ứng thật.
- Ghi vào `../AI_FAILURE_AUDIT.md` các lỗi AI gặp thật khi làm bài này (nếu có).
