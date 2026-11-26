# URL Contract: Photo & Evidence Gallery (Homework 3)

Hợp đồng giữa trang gallery và các liên kết chia sẻ được, viết trước khi code. Không có server: toàn bộ state của gallery nằm trong query string.

## 1. Tham số

| Tham số | Giá trị hợp lệ | Hành vi |
|---|---|---|
| `category` | `all` (mặc định, có thể vắng), `scene`, `document`, `chart` | Giá trị lạ, rỗng hoặc vắng thì coi là `all`, không lỗi, không sửa URL |
| `photoId` | id có trong danh sách ảnh (`p01` đến `p12`) | Có thì mở lightbox. Id không tồn tại thì không mở, hiện thông báo trong vùng nội dung |

## 2. Route

| Route | Trang |
|---|---|
| `/` | Gallery |
| `/about` | Giải thích dữ liệu, tham số URL và cam kết truy cập |
| `*` | 404 trong vùng nội dung |

## 3. Lịch sử trình duyệt

| Thao tác | Kiểu |
|---|---|
| Mở ảnh từ lưới | push (nút Back đóng lightbox) |
| Chuyển ảnh trước/sau | replace |
| Đóng lightbox | replace, chỉ xóa `photoId`, giữ `category` và mọi tham số khác |
| Đổi danh mục | push, đồng thời xóa `photoId` |

## 4. Kiểu dữ liệu

```js
/** @typedef {'all'|'scene'|'document'|'chart'} CategorySlug */
/** @typedef {{ slug: CategorySlug, label: string }} Category */
/** @typedef {{ id: string, category: Exclude<CategorySlug, 'all'>, title: string, alt: string, caption: string, src: string, width: 600, height: 400 }} Photo */
```
