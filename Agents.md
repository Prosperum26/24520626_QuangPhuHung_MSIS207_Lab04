# Agents.md — Hướng dẫn cho AI agent (Lab 04)

Đọc [docs/Context.md](docs/Context.md) và [docs/project-rules.md](docs/project-rules.md) trước. File này là **luật làm việc**: AI sinh code, con người kiểm chứng. Không chấp nhận output chưa kiểm chứng.

## 1. Nguyên tắc

1. **Atomic**: mỗi lượt chỉ làm **một** task ID trong `TASK_DECOMPOSITION.md` của bài đang làm (hiện là [Exercise_Lab04/TASK_DECOMPOSITION.md](Exercise_Lab04/TASK_DECOMPOSITION.md)). Không gộp nhiều task, không dán nguyên đề vào làm một lần.
2. **Contract-first**: có contract (API, props, state, JSDoc) trước, rồi mới viết code.
3. **Test trước khi code**: viết test đỏ, rồi code tối thiểu cho xanh, rồi dọn.
4. **Verify-before-claim**: chỉ nói "xong" khi đã chạy test/lệnh kiểm chứng và thấy output thật.
5. **Giải thích được**: người dùng sẽ bị sửa mã ngay tại chỗ khi **tắt hết AI**. Mã đơn giản, mỗi quyết định ở một chỗ, kèm lý do ngắn. Không thêm thư viện hay abstraction mà người dùng không giải thích được.
6. **Đúng scope**: bài này không làm TanStack Query, Next.js, RSC, Mongoose (Mongoose thuộc Homework 2).

## 2. Quy trình mỗi task

1. **Slice**: xác nhận task thuộc dòng nào của WBS (ví dụ `S1-03`).
2. **Contract**: viết hoặc cập nhật contract và invariant.
3. **Fail test**: viết test đỏ cho đúng task.
4. **Implement**: code tối thiểu. **Refactor**: dọn, test vẫn xanh.
5. **Verify**: chạy `npm test`, `npm run lint`, xem `git diff`, kiểm DevTools nếu task liên quan (Console, Network, Profiler, Accessibility tree). Báo kết quả thật, kể cả khi fail.

Nếu yêu cầu mơ hồ hoặc phải đoán, **hỏi một câu ngắn** thay vì tự bịa. Nếu slide hoặc đề sai hay mâu thuẫn, báo ra, đừng chép theo.

## 3. Quy tắc code

Danh sách cấm và danh sách bắt buộc đầy đủ ở [project-rules.md §4 và §5](docs/project-rules.md). Tóm tắt những điều AI hay phạm:

- Cú pháp React Router v5 (`<Switch>`, `<Redirect>`, `exact`, `component=`) và import từ `react-router-dom`.
- `useEffect` để tính validation hoặc state dẫn xuất; effect thiếu dependency hoặc thiếu cleanup.
- Fetch không kiểm `res.ok`, không có `AbortController`, hoặc `setState` sau khi đã abort.
- Một `useId()` chung cho nhiều field; `...props` không chuyển xuống `<input>`.
- Chuỗi kết nối hay bí mật nằm cứng trong mã; callback Mongoose.
- `req.body` mà thiếu `express.json()`; không kiểm payload POST.
- Icon-only button thiếu `aria-label`; `<button>` thiếu `type`.

### Khả năng truy cập (WCAG 2.2 AA)

Chi tiết ở [project-rules.md §6](docs/project-rules.md). Không tự khẳng định "đạt WCAG" khi chưa kiểm; ghi rõ tiêu chí nào, kiểm bằng cách nào. Tài liệu Markdown cũng theo WCAG: heading phân cấp, link có mô tả, code block có ngôn ngữ, ảnh có alt, không dùng emoji mang nghĩa.

### Sẵn sàng cho bảo vệ trực tiếp

Giảng viên đổi một yêu cầu trên code đang chạy trong 3 phút. Bốn thử thách đã công bố nằm ở slide 27 và bảng ánh xạ trong WBS (mục 7.1). Đừng đóng gói quá mức: route ở `App.jsx`, luật ở `rules.js`, `fetch` ở một hàm trong hook.

## 4. Kiểm chứng

- Client: `npm test` (Vitest + jsdom + RTL), `npm run lint`, `npm run build`. Server: `npm test` (Vitest + supertest).
- Lệnh grep lặp lại được (không cần AI): `grep -rc useEffect client/src/sprint2-form` phải ra 0; `grep -rn "react-router-dom\|<Switch\|<Redirect" client/src` phải ra 0 dòng.
- Trước khi báo hoàn thành: chạy test và lint, dán kết quả thật.

## 5. Git

- **AI được commit cục bộ** (người dùng đã cho phép ở Lab04), nhưng **không push** và **không thêm dòng `Co-Authored-By`**: người dùng tự thêm co-author sau. Mỗi commit atomic, chỉ `git add` đúng các file của task (không `git add -A`), xem `git diff --staged` trước khi commit.
- Mỗi task hoặc cụm task xong là một commit atomic, Conventional Commits. Dùng đúng nguyên văn các message đề đã chốt (xem WBS).
- Không `--force`, không `--no-verify`. Không đề xuất commit file không liên quan, `node_modules/`, `dist/`, `.env`.

## 6. Artifact cần giữ

| File | Vai trò |
|---|---|
| [docs/Context.md](docs/Context.md) | Nội dung slide gốc |
| [Agents.md](Agents.md) | Luật cho AI (file này) |
| [docs/project-rules.md](docs/project-rules.md) | Quy tắc dự án để nạp cho AI |
| [shared/api-contract.md](shared/api-contract.md) | Hợp đồng API, viết trước code server |
| `*/TASK_DECOMPOSITION.md` | WBS từng bài, tick `[x]` khi đã verify |
| [docs/AI_FAILURE_AUDIT.md](docs/AI_FAILURE_AUDIT.md) | Báo cáo lỗi AI có bằng chứng (15% điểm) |
| `docs/prompt_logs/` | Export session AI cho mỗi lần code mỗi bài |
| `*/evidence/` | Ảnh DevTools, log kiểm chứng |

Với `AI_FAILURE_AUDIT.md`: nội dung do người dùng viết từ lỗi **thật** đã gặp. AI chỉ chỉnh câu chữ và định dạng, **không bịa** prompt, bằng chứng, commit hash hay kết quả DevTools.

## 7. Cách trả lời người dùng

- Tiếng Việt, thuật ngữ kỹ thuật giữ tiếng Anh. Ngắn gọn, nói thẳng kết quả.
- Nêu rõ đã verify gì và chưa verify gì. Test fail thì nói và dán output.
- Việc ngoài scope hoặc khó đảo ngược (xoá file, đổi stack, cài dependency lớn): hỏi trước.
- Dữ liệu demo (smartPeople, các kênh forum) chỉ là dữ liệu mẫu trong đúng bài đó.
