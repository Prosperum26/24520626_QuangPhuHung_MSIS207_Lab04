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
      <p>Đã kiểm: dùng được hoàn toàn bằng bàn phím, lightbox là phần tử dialog gốc (phím Esc đóng, focus quay về ảnh đã bấm).</p>
      <p>Chưa kiểm: trình đọc màn hình thật (NVDA, Narrator) và thiết bị cảm ứng thật.</p>
    </article>
  );
}
