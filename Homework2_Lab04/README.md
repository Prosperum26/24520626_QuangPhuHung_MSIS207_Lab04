# Homework 2: Esports Fair-Play Appeal Tribunal

Mô phỏng cổng kháng cáo cho vụ Himass và TanVuu (slide 21). Đây là app phục vụ bài tập MSIS207, không phải cổng chính thức của KRAFTON. Dữ kiện hồ sơ lấy từ báo chí, mỗi hồ sơ đều có nguồn kèm theo.

| Yêu cầu của slide | Ở đâu |
|---|---|
| Route động `/dossier/:playerID` | [client/src/App.jsx](client/src/App.jsx), [pages/DossierPage.jsx](client/src/pages/DossierPage.jsx) |
| Form dùng Context, validate real-time | [client/src/form/](client/src/form/); luật dùng chung với server: [shared/appealRules.js](shared/appealRules.js) |
| `useAppealSlaTimer()` không trôi, đồng bộ theo độ lệch đồng hồ server | [client/src/hooks/useAppealSlaTimer.js](client/src/hooks/useAppealSlaTimer.js) |
| Ma trận bất cân xứng dẫn xuất bằng `useMemo` (slide 33) | [client/src/domain/matrix.js](client/src/domain/matrix.js) |
| `AI_FAILURE_AUDIT.md` | [../AI_FAILURE_AUDIT.md](../AI_FAILURE_AUDIT.md) |

- Hợp đồng API: [appeal-api-contract.md](../shared/appeal-api-contract.md)
- Kế hoạch và trạng thái: [TASK_DECOMPOSITION.md](TASK_DECOMPOSITION.md)

Server là Express 5 và giữ dữ liệu trong bộ nhớ, không dùng DB. Vì vậy khởi động lại server thì mất các đơn đã nộp và hạn SLA được tính lại.

## Chạy

Cần Node 22 trở lên.

```bash
cd Homework2_Lab04
cp .env.example .env

cd server
npm install
npm run dev          # http://localhost:3003

cd ../client         # mở terminal khác
npm install
npm run dev          # http://localhost:5175
```

Hạn SLA bằng giờ khởi động server cộng `SLA_HOURS`, mặc định 48 giờ. Muốn xem đồng hồ chạy về 0 thì đặt `SLA_HOURS=0.005` (khoảng 18 giây) trong `.env`, rồi khởi động lại server.

## Kiểm chứng

```bash
cd server && npm test     # Vitest + supertest
cd client && npm test     # Vitest + jsdom + React Testing Library
cd client && npm run lint
cd client && npm run build
```

Kết quả chạy thử trên Edge (headless) và ảnh chụp ở khổ 1280px và 375px nằm trong [evidence/](evidence/).
