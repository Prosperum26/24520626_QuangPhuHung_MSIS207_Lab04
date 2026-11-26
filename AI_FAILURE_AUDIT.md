# AI Failure Audit — Lab 04

> Chiếm 15% điểm. **Nội dung do bạn viết từ lỗi thật bạn đã gặp.** AI chỉ chỉnh câu chữ và định dạng, không bịa prompt, bằng chứng, commit hash hay kết quả DevTools.
> Trạng thái: **đã điền Mục 1 và 2** (lỗi thật ở Homework 2, bạn xác nhận); Mục 3 còn trống. Phần "Ứng viên" bên dưới chỉ là gợi ý để bạn chọn và tự tái hiện; chưa phải mục audit.

## 1. Cách điền mỗi mục

Mỗi mục có đủ năm phần, theo yêu cầu của đề (slide 18):

| Phần | Nội dung |
|---|---|
| Prompt | Câu lệnh đã đưa cho AI (dán nguyên văn từ prompt log) |
| Output sai | Đoạn mã hoặc khẳng định AI đưa ra |
| Vì sao sai | API không tồn tại, vòng lặp effect, lỗi kiểu, bí mật nằm cứng... |
| Bằng chứng | Ảnh DevTools, log test, `git diff`, tên file trong `evidence/` |
| Cách sửa | Các bước kiểm chứng và sửa thủ công; commit tương ứng |

## 2. Ứng viên (chọn, tái hiện, rồi tự viết)

Hai nhóm: lỗi nằm sẵn trong code mẫu của slide (AI hay chép theo), và sự cố có thật trong phiên làm việc với AI.

| # | Nguồn | Lỗi | Cách tái hiện để lấy bằng chứng |
|---|---|---|---|
| 1 | Slide 22 | `p.id === id` so sánh sai kiểu nếu ID là số | Đổi ID trong `people.json` thành số, mở `/people/1`: ra 404 |
| 2 | Slide 14 | Một `useId()` chung ở Provider làm mọi ô trùng `id` | Chép mẫu slide, xem Accessibility tree: nhiều ô cùng `id` |
| 3 | Slide 24 | `...props` không chuyển xuống `<input>` nên mất `value` và `onChange` | Chép mẫu slide, gõ vào ô: không nhận chữ |
| 4 | Slide 25 | Không kiểm `res.ok`; `loading` không reset khi đổi kênh | Tắt server hoặc trả 500: giao diện hiện dữ liệu rỗng thay vì lỗi |
| 5 | Slide 26 | Thiếu `express.json()` nên `req.body` là `undefined` | Gọi POST không có middleware: server ném lỗi |
| 6 | Slide 10 | `Layout` trả hai phần tử ngang hàng không bọc Fragment; `NavLink` thiếu `to` | Chép mẫu slide, xem lỗi compile |
| 7 | Phiên làm việc | `npm install react-router` không ghim phiên bản kéo về **v8.5.1** trong khi đề yêu cầu v7 | Bản v8 chưa từng được commit: tái hiện bằng `npm install react-router` trong folder trống rồi chụp `npm ls react-router`; commit `866531e` đã ghim `^7.18.5` |
| 8 | Phiên làm việc | Lệnh `git add` liệt kê một file đã xoá nên bị dừng hoàn toàn, commit chỉ chứa việc xoá file | Xem `git reflog`: commit `f6585fa` rồi `d0753c8` sau khi amend |
| 9 | Phiên làm việc | Comment do AI viết chứa chữ `useEffect` làm cổng `grep` của S2-03 báo sai | Xem `git diff` sửa comment ở `FormProvider.jsx` |

Mục 7 đến 9 có thật trong lịch sử repo; bạn vẫn cần tự kiểm lại trước khi ghi vào audit. Mục 1 đến 6 là lỗi mà AI **có thể** sinh ra nếu chép theo slide: chỉ ghi vào audit nếu bạn tái hiện được.

## 3. Các mục audit

### Mục 1: Test timer treo vì `waitFor` poll bằng `setInterval` đang bị giả (Homework 2, H2-07)

- **Prompt:** "ok cũng ko nhất thiết phải chia ra nữa, thử tự làm hết trong phiên này đi, làm xong thì phân sub agent review nhanh, chụp evidence và báo cáo mình" (tin nhắn gốc của mình; cũng nằm trong prompt log nếu có). Kế hoạch do AI viết trước đó ở `Homework2_Lab04/TASK_DECOMPOSITION.md`, bước H2-07 ghi: dùng `vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })` cho test của `useAppealSlaTimer`.
- **Output sai:** AI viết `useAppealSlaTimer.test.jsx` với `fakeTimers` giả `setInterval`, rồi chờ kết quả bất đồng bộ bằng `await waitFor(() => expect(result.current.synced).toBe(true))` của React Testing Library.
- **Vì sao sai:** `waitFor` của RTL kiểm tra lại điều kiện theo chu kỳ bằng `setInterval`. Khi chính `setInterval` bị giả, đồng hồ giả không tự chạy nên `waitFor` không bao giờ kiểm tra lại và hết giờ. Lỗi nằm ở bài test chứ không phải ở hook.
- **Bằng chứng:** chạy `npx vitest run src/hooks/useAppealSlaTimer.test.jsx`: 4 trong 6 test đỏ với `AssertionError: expected false to be true` ở dòng `waitFor`, mỗi test chờ khoảng 1 giây (hết timeout 1000ms của `waitFor`) rồi mới fail. Lần chạy sau khi sửa: 6/6 xanh.
- **Cách sửa:** viết hàm `until(check)` trong file test, thử `check()` rồi nếu chưa đạt thì chờ 5ms bằng `setTimeout` thật (`setTimeout` không nằm trong `toFake`), tối đa 100 lần. Thay mọi `waitFor` trong file đó bằng `until`. Sửa nằm trong commit `2f4516c`. Hook không phải sửa gì. (Một lần sửa `sed` làm dính cả khối hàm vào một dòng comment nên `until is not defined`; đã sửa bằng Edit.)

### Mục 2: Vitest báo "failed to find the current suite" khi chạy từ đường dẫn ổ đĩa chữ thường (Homework 2, H2-01)

- **Prompt:** cùng yêu cầu như Mục 1 (làm hết plan H2 trong một phiên). Lệnh test do AI tự chạy: `npm test` trong `Homework2_Lab04/server`, thư mục làm việc của AI lúc đó là `c:\Dev\Projects\...` (ổ `c:` viết thường).
- **Output sai:** AI chạy test 8 case của `appealRules` từ thư mục `c:/...` và nhận lỗi, rồi mất vài lượt kiểm tra: thử một test tối thiểu `expect(1).toBe(1)` (vẫn lỗi) và kiểm tra có hai bản vitest hay không bằng `npm ls vitest`.
- **Vì sao sai:** thông báo lỗi không nói gì về đường dẫn. Cùng một file được nạp hai lần dưới hai cách viết ổ đĩa (`c:` và `C:`), nên `vitest` được import thành hai module khác nhau; test đăng ký vào bản này nhưng runner đọc từ bản kia. Đây là trường hợp lỗi của công cụ nhưng AI cần tự tìm ra nguyên nhân thay vì đoán.
- **Bằng chứng:**
  - `TypeError: Cannot read properties of undefined (reading 'config')` ở `describe(...)`, rồi (với test tối thiểu) `Error: Vitest failed to find the current suite. One of the following is possible:`.
  - `npm ls vitest` chỉ có một bản `vitest@5.1.2`, nên không phải trùng phiên bản.
  - Cùng lệnh `npx vitest run` nhưng chạy sau `cd "C:/Dev/Projects/..."` (chữ hoa): `Tests  8 passed (8)`.
- **Cách sửa:** luôn `cd` bằng đường dẫn ổ chữ hoa (`C:/...`) trước khi chạy `vitest`. Không cần đổi code hay cấu hình. Chưa có commit riêng vì đây là thao tác khi chạy lệnh.

### Mục 3

- **Prompt:** (bạn điền)
- **Output sai:** (bạn điền)
- **Vì sao sai:** (bạn điền)
- **Bằng chứng:** (bạn điền)
- **Cách sửa:** (bạn điền)
