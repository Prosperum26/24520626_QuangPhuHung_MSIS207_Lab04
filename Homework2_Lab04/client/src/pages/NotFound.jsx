import { Link } from 'react-router';

/** 404 nằm trong vùng nội dung, header vẫn giữ. */
export function NotFound({ title = 'Không tìm thấy trang' }) {
  return (
    <section aria-labelledby="not-found-title">
      <h2 id="not-found-title">{title}</h2>
      <p>
        <Link to="/">Về danh sách hồ sơ</Link>
      </p>
    </section>
  );
}
