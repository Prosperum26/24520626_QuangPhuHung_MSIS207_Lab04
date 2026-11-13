# Ghi chú bảo vệ trực tiếp (3 phút, tắt hết AI)

Tài liệu ôn cho buổi bảo vệ của Exercise Lab 04. Quy trình của giảng viên: kiểm `git log` và WBS, kiểm DevTools, rồi đổi một yêu cầu và bạn sửa trong 3 phút. Mọi đường dẫn tính từ `Exercise_Lab04/`.

## 1. Giải thích kiến trúc trong 3 phút

Nói theo thứ tự: bản đồ, state nằm đâu, vì sao.

### 1.1 Bản đồ

| Phần | File | Việc làm |
|---|---|---|
| Toàn bộ route | `client/src/App.jsx` | Duy nhất một chỗ khai báo `<Routes>` |
| Khung chung | `client/src/AppLayout.jsx` | Thanh điều hướng và `<Outlet/>` |
| Sprint 1: danh bạ | `client/src/sprint1-router/` | `PeopleLayout` (master), `PersonDetail` (detail, tải lười), `people.js` |
| Sprint 2: form | `client/src/sprint2-form/` | `rules.js` (luật), `FormProvider.jsx` (state), `InputField.jsx`, `SimpleForm.jsx` |
| Sprint 3: forum | `client/src/sprint3-forum/` | `forumApi.js` (mọi `fetch`), `useForumMessages.js` (hook), `ForumPage.jsx` |
| Server | `server/src/` | `store.js`, `validate.js`, `app.js`, `server.js` |
| Hợp đồng API | `../shared/api-contract.md` | Viết trước khi code |

### 1.2 State nằm đâu và vì sao

| State | Nằm ở | Lý do |
|---|---|---|
| Người đang xem | URL (`/people/:id`) | Chia sẻ link và F5 không mất; `useParams` đọc ra |
| `values`, `touched`, `submitted` của form | `FormProvider` (`useState`) | Là dữ liệu độc lập, nhiều ô cùng đọc nên đặt vào context |
| `errors`, `isValid`, `visibleErrors` | **Tính trong render**, không là state | Dữ liệu dẫn xuất; tránh chuỗi `useEffect` gây nhiều lần render mỗi phím |
| `submittedPerson` | `AddPersonForm` (`useState`) | Chỉ lần gửi hợp lệ gần nhất, chỉ một component dùng |
| Kênh forum hiện tại | `ForumPage` (`useState`) | Chỉ trang này dùng |
| Tin nhắn, `status`, `error` | `useForumMessages` (`useState`) | Dữ liệu từ server, lưu kèm tên kênh để `status` được dẫn xuất |
| Tin nhắn trên server | `store.js` trong bộ nhớ | Đủ cho bài; Mongoose ở Homework 2 |

Câu chốt: "Dữ liệu độc lập thì là state; cái gì tính được từ state thì tính trong render."

### 1.3 Ba điều nên nhắc

1. **Vì sao form không có `useEffect`:** `errors` là hàm thuần của `values`, nên một phím gõ chỉ một lượt render (đã có test dùng `Profiler`).
2. **Vì sao hook forum không bị race condition:** mỗi lần chạy effect tạo một `AbortController`, cleanup `abort()`, và mọi `setState` sau `await` đứng sau `if (!signal.aborted)`; `status` là `loading` khi kết quả đang lưu thuộc kênh khác.
3. **Vì sao validation khớp hai đầu:** cùng giới hạn 40 và 500 ở `server/src/validate.js` và `client/src/sprint3-forum/forumApi.js`, ghi chú trỏ về `api-contract.md`.

## 2. Bốn thử thách và cách sửa

Tập trên nhánh nháp: `git switch -c defense-practice`, sửa xong chạy `npm test` rồi `git switch main`. Mỗi phần dưới đây là phác thảo, không phải mã đã có trong repo; bạn tự gõ lại để nhớ.

### 2.1 Đồng bộ state với URL (`useSearchParams`)

**Chỗ sửa:** `client/src/sprint3-forum/ForumPage.jsx`, dòng `useState(CHANNELS[0])`.

```jsx
import { useSearchParams } from 'react-router';

const [searchParams, setSearchParams] = useSearchParams();
const requested = searchParams.get('channel');
// Kiểm với danh sách kênh: URL là đầu vào không tin cậy.
const channel = CHANNELS.includes(requested) ? requested : CHANNELS[0];
const setChannel = (next) =>
  setSearchParams((prev) => {
    const params = new URLSearchParams(prev); // giữ các tham số khác
    params.set('channel', next);
    return params;
  });
```

**Kiểm chứng:** bấm kênh thì URL đổi thành `?channel=notNasa`; F5 giữ nguyên kênh; `?channel=zzz` về `nasa`. **Bẫy:** `setSearchParams({ channel })` xoá mọi tham số khác.

### 2.2 Validation chéo trường (confirm email)

**Chỗ sửa:** `client/src/sprint2-form/rules.js`, thêm ô trong `SimpleForm.jsx`.

```js
// INITIAL_VALUES thêm confirmEmail: '', RULES thêm:
confirmEmail: (value, all) =>
  value.trim() === all.email.trim() ? null : 'Email nhập lại không khớp',
```

```jsx
<InputField name="confirmEmail" label="Nhập lại email" type="email" autoComplete="off" />
```

**Kiểm chứng:** nhập hai email khác nhau, rời ô thì thấy lỗi; sửa cho khớp thì lỗi biến mất ngay. **Bẫy:** quên thêm khoá vào `INITIAL_VALUES` thì test `INITIAL_VALUES` khớp `RULES` đỏ. Không cần `useEffect`, vì `evaluateErrors` đã truyền toàn bộ `values` cho mỗi luật.

### 2.3 Tự thử lại với exponential backoff

**Chỗ sửa:** `client/src/sprint3-forum/forumApi.js`, hàm `fetchMessages`.

```js
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export async function fetchMessages(channel, signal, { retries = 3, baseMs = 300 } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const res = await fetch(messagesUrl(channel), { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      if (signal.aborted || attempt >= retries) throw error;
      await sleep(baseMs * 2 ** attempt, signal); // 300, 600, 1200 ms
    }
  }
}
```

**Kiểm chứng:** tắt server, mở `/forum`, thấy Network có các request cách nhau 300, 600, 1200 ms rồi mới hiện lỗi; đổi kênh giữa chừng thì chuỗi thử lại cũ dừng. **Bẫy:** `sleep` phải nghe `signal`, nếu không timer cũ vẫn chạy sau khi huỷ. Chỉ nên thử lại lỗi mạng và 5xx, không thử lại 4xx.

### 2.4 Route guard (chuyển hướng về login, nhớ URL đích)

**Chỗ sửa:** `client/src/App.jsx` (một chỗ khai báo route).

```jsx
import { Navigate, useLocation } from 'react-router';

function RequireAuth({ isLoggedIn, children }) {
  const location = useLocation();
  return isLoggedIn ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

<Route path="form" element={<RequireAuth isLoggedIn={isLoggedIn}><SimpleForm /></RequireAuth>} />
```

Trang `/login` sau khi đăng nhập thì `navigate(location.state?.from?.pathname ?? '/', { replace: true })`. **Kiểm chứng:** chưa đăng nhập vào `/form` thì bị chuyển sang `/login`; đăng nhập xong quay lại đúng `/form`. **Bẫy:** quên `replace` làm nút Back kẹt vòng lặp.

## 3. Lệnh kiểm tra nhanh

```bash
cd client && npm test && npm run lint && npm run build
cd ../server && npm test
grep -rc useEffect client/src/sprint2-form     # mỗi dòng phải là :0
grep -rn "react-router-dom\|<Switch\|<Redirect" client/src   # không ra dòng nào
git log --oneline                              # message đúng nguyên văn đề
```
