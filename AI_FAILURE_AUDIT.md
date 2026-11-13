# AI Failure Audit — Lab 04

> Chiếm 15% điểm. **Nội dung do bạn viết từ lỗi thật bạn đã gặp.** AI chỉ chỉnh câu chữ và định dạng, không bịa prompt, bằng chứng, commit hash hay kết quả DevTools.
> Trạng thái: **chưa điền**. Phần "Ứng viên" bên dưới chỉ là gợi ý để bạn chọn và tự tái hiện; chưa phải mục audit.

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

### Mục 1

- **Prompt:** (bạn điền)
- **Output sai:** (bạn điền)
- **Vì sao sai:** (bạn điền)
- **Bằng chứng:** (bạn điền)
- **Cách sửa:** (bạn điền)

### Mục 2

- **Prompt:** (bạn điền)
- **Output sai:** (bạn điền)
- **Vì sao sai:** (bạn điền)
- **Bằng chứng:** (bạn điền)
- **Cách sửa:** (bạn điền)

### Mục 3

- **Prompt:** (bạn điền)
- **Output sai:** (bạn điền)
- **Vì sao sai:** (bạn điền)
- **Bằng chứng:** (bạn điền)
- **Cách sửa:** (bạn điền)
