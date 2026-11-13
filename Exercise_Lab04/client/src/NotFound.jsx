/**
 * Trạng thái 404 dùng cho cả đường dẫn lạ (toàn trang) và id không tồn tại (trong vùng nội dung).
 * @param {{ message?: string }} props
 */
export function NotFound({ message = '404: Không tìm thấy trang' }) {
  return (
    <section role="alert">
      <p>{message}</p>
    </section>
  );
}
