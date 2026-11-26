# Homework 3: Photo & Evidence Gallery

Thư viện ảnh nhiều route: lọc danh mục và mở ảnh bằng liên kết chia sẻ được, lightbox dùng phần tử `<dialog>` gốc. Không có server. Mọi ảnh là SVG minh họa tự sinh, không phải ảnh hay bằng chứng thật.

| Yêu cầu của slide | Ở đâu |
|---|---|
| Deep link bằng `useSearchParams()` cho danh mục và ảnh đang mở | [client/src/hooks/useGalleryParams.js](client/src/hooks/useGalleryParams.js), [pages/GalleryPage.jsx](client/src/pages/GalleryPage.jsx) |
| Lightbox bằng `<dialog>` gốc | [client/src/components/PhotoLightbox.jsx](client/src/components/PhotoLightbox.jsx) |
| WCAG 2.2 AA và Lighthouse 100 | kiểm chứng ở [TASK_DECOMPOSITION.md](TASK_DECOMPOSITION.md) §7 và [evidence/](evidence/) |

- Hợp đồng URL: [gallery-url-contract.md](../shared/gallery-url-contract.md)
- Kế hoạch và trạng thái: [TASK_DECOMPOSITION.md](TASK_DECOMPOSITION.md)

## Chạy

Cần Node 22 trở lên.

```bash
cd Homework3_Lab04/client
npm install
npm run dev          # http://localhost:5176
```

## Tham số URL

| Tham số | Giá trị | Ghi chú |
|---|---|---|
| `category` | `all` (mặc định), `scene`, `document`, `chart` | Giá trị lạ được coi là `all` |
| `photoId` | `p01` đến `p12` | Có giá trị hợp lệ thì mở lightbox; id lạ thì hiện thông báo |

Ví dụ: `http://localhost:5176/?category=document&photoId=p06`. Đóng lightbox chỉ xóa `photoId`, giữ `category`.

Tái tạo ảnh minh họa: `npm run photos` (script [scripts/generate-photos.mjs](client/scripts/generate-photos.mjs) đọc [src/data/photos.js](client/src/data/photos.js)).

## Kiểm chứng

```bash
cd client && npm test         # Vitest + jsdom + React Testing Library + axe-core
cd client && npm run lint
cd client && npm run build
```

Báo cáo Lighthouse, kết quả chạy thử trên Edge và ảnh chụp nằm trong [evidence/](evidence/).
