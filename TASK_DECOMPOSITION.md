# TASK_DECOMPOSITION — Lab 04 (WBS tổng)

> Bức tranh tổng của Lab 4: bài nào, nằm ở đâu, trạng thái, cổng kiểm tra. Chi tiết từng bài nằm trong file WBS của folder bài (liên kết bên dưới).
> Luật: mỗi prompt AI tham chiếu đúng một task ID, kèm [project-rules.md](project-rules.md). Tick `[x]` chỉ khi đã chạy lệnh kiểm chứng và thấy output thật.

## 1. Bản đồ bài

| Bài | Nội dung | Thư mục | WBS | Trạng thái |
|---|---|---|---|---|
| Exercise | Multi-route SPA, Context Form Engine, Forum full-stack (3 sprint) | `Exercise_Lab04/` | [WBS Exercise](Exercise_Lab04/TASK_DECOMPOSITION.md) | Code xong; còn bằng chứng DevTools và tài liệu bảo vệ |
| Homework 1 | Card-Swipe Deck "Hẹn Hò Nhưng Không Yêu" (Express + Mongoose 8), slide 20 | `Homework1_Lab04/` | [WBS HW1](Homework1_Lab04/TASK_DECOMPOSITION.md) | Xong H1-00 đến H1-14; còn thử NVDA và cảm ứng thật |
| Homework 2 | Esports Fair-Play Appeal Tribunal, slide 21 | `Homework2_Lab04/` | [WBS HW2](Homework2_Lab04/TASK_DECOMPOSITION.md) | Xong H2-00 đến H2-09; còn H2-10 (AI_FAILURE_AUDIT, người dùng viết) |
| Homework 3 | Photo and Evidence Gallery, slide 19 và 30 | `Homework3_Lab04/` | [WBS HW3](Homework3_Lab04/TASK_DECOMPOSITION.md) | Xong H3-00 đến H3-08; còn NVDA và cảm ứng thật |

Slide đánh số Homework không nhất quán (slide 19 và 20 cùng ghi "Homework 1", code contract ghi 3 và 4). Thứ tự trên chốt theo slide 20, 21 và slide 30.

## 2. Quy ước

- **Task ID:** `S0` đến `S4` cho sprint của Exercise (ví dụ `S2-06`); Homework dùng `H1`, `H2`, `H3`.
- **Commit:** atomic, Conventional Commits. Message chốt sẵn theo đề dùng đúng nguyên văn: `feat: router layout`, `feat: detail route handling`, `feat: form context`, `feat: input field validation`, `feat: inspector output`.
- **Bằng chứng:** lưu ở `evidence/` cạnh WBS của bài.
- **Cấu trúc nộp** (slide 34): `project-rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md`, `.env.example` ở gốc repo.

## 3. Cổng kiểm tra chung

- Client: `npm test`, `npm run lint`, `npm run build`. Server: `npm test`.
- Không có `react-router-dom`, `<Switch>`, `<Redirect>`, `defaultProps`, chuỗi kết nối cứng trong mã.
- Repo clone sạch chạy được: một lệnh cài, một lệnh chạy cho mỗi project (xem [README.md](README.md)).
