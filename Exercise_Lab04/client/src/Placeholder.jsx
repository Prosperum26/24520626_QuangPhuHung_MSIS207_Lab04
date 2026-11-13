/** Chỗ trống cho route chưa làm; thay bằng trang thật ở sprint tương ứng. */
export function Placeholder({ title, sprint }) {
  return (
    <section>
      <h2>{title}</h2>
      <p>Sẽ làm ở {sprint}.</p>
    </section>
  );
}
