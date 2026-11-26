import { Link } from 'react-router';

/** Giải thích dữ liệu, tham số URL và phạm vi đã kiểm về truy cập. Trang này tải lazy. */
export default function AboutPage() {
  return (
    <article aria-labelledby="about-title">
      <h2 id="about-title">Giới thiệu</h2>
      <p>
        Đây là bài tập MSIS207 (Homework 3). Mọi ảnh là ảnh SVG minh họa do một script tự sinh, không phải ảnh hay bằng chứng thật
        của ai.
      </p>

      <h3>Tham số trên URL</h3>
      <p>Trạng thái của thư viện nằm hoàn toàn trong địa chỉ, nên có thể chia sẻ và dùng nút Back.</p>
      <dl>
        <dt>category</dt>
        <dd>all (mặc định), scene, document hoặc chart. Giá trị khác được coi là all.</dd>
        <dt>photoId</dt>
        <dd>p01 đến p12. Có giá trị hợp lệ thì mở ảnh đó trong lightbox.</dd>
      </dl>
      <p>
        Ví dụ: <Link to="/?category=document&photoId=p06">ảnh p06 trong danh mục Tài liệu</Link>.
      </p>

      <h3>Truy cập</h3>
      <p>
        Đã kiểm trên Edge bằng bàn phím: Tab tới ảnh, Enter mở lightbox, Esc đóng, focus quay về đúng ảnh đã bấm, Tab không rơi vào nội dung nền khi
        lightbox mở. Đã kiểm tự động: axe-core trên 6 trạng thái trang (không gồm tương phản màu) và Lighthouse Accessibility 100 trên trang chủ và một
        liên kết ảnh.
      </p>
      <p>
        Chưa kiểm: điều hướng bằng bàn phím ở bộ lọc, nút chuyển ảnh và các trang phụ; tương phản màu ở trang giới thiệu và trang 404; trình đọc màn hình thật
        (NVDA, Narrator); thiết bị cảm ứng thật.
      </p>
    </article>
  );
}
