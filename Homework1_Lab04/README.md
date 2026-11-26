# Homework 1: Card-Swipe Deck "Hẹn Hò Nhưng Không Yêu"

App quẹt hồ sơ hẹn hò full-stack: quẹt bằng phím, nút bấm hoặc kéo thả; hoàn tác từng bước (LIFO); điểm bất đối xứng tính từ lịch sử quẹt; ván lưu trong MongoDB nên mở lại app (kể cả F5) là quẹt tiếp ván dở.

- Thiết kế: [spec](../docs/superpowers/specs/2026-11-26-hw1-swipe-deck-design.md)
- Hợp đồng API: [swipe-api-contract.md](../shared/swipe-api-contract.md)
- Kế hoạch và trạng thái: [TASK_DECOMPOSITION.md](TASK_DECOMPOSITION.md)

## Yêu cầu

Node 22 trở lên, Docker (để chạy MongoDB 8).

## Chạy

```bash
cd Homework1_Lab04
docker compose up -d          # MongoDB 8 ở localhost:27017
cp .env.example .env

cd server
npm install
npm run seed                  # nạp 12 hồ sơ; xoá mọi ván và lượt quẹt cũ
npm run dev                   # http://localhost:3002

cd ../client                  # terminal khác
npm install
npm run dev                   # http://localhost:5174
```

## Điều khiển

| Thao tác | Phím | Nút | Kéo thẻ |
|---|---|---|---|
| Bỏ qua (−5) | `←` | Bỏ qua | sang trái quá 80px |
| Thích (+10) | `→` | Thích | sang phải quá 80px |
| Siêu thích (+20) | `↑` | Siêu thích | lên trên quá 80px |
| Hoàn tác | `Backspace` | Hoàn tác | |

Điểm và mọi hằng số nằm ở [client/src/domain/swipeConfig.js](client/src/domain/swipeConfig.js).

## Kiểm chứng

```bash
cd server && npm test         # Vitest + supertest trên DB swipe_deck_test (cần Mongo đang chạy)
cd client && npm test         # Vitest + jsdom + React Testing Library
cd client && npm run lint
cd client && npm run build
```

Bằng chứng đo trên trình duyệt thật (Lighthouse, chạy thử trên Edge, ảnh 375px và 320px) nằm ở [evidence/](evidence/).
