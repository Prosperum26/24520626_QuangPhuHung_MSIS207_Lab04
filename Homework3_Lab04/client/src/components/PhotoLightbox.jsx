import { useEffect, useId, useRef } from 'react';
import { useNavigate } from 'react-router';
import styles from './PhotoLightbox.module.css';

/**
 * Lightbox bằng <dialog> gốc: trình duyệt lo focus trap, phím Esc và làm phần còn lại của trang trơ.
 * Đây là chỗ DUY NHẤT dùng useEffect: đồng bộ dialog.showModal()/close() (DOM ngoài React) với URL.
 *
 * @param {{
 *   photo: import('../data/photos.js').Photo | null,
 *   prev: import('../data/photos.js').Photo | null,
 *   next: import('../data/photos.js').Photo | null,
 *   position: { index: number, total: number } | null,
 *   hrefFor: (id: string) => string,
 *   onClose: () => void,
 * }} props
 */
export function PhotoLightbox({ photo, prev, next, position, hrefFor, onClose }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const navigate = useNavigate();
  const open = photo !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Guard: showModal() trên dialog đã mở ném InvalidStateError (StrictMode chạy effect hai lần).
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Sự kiện close tới cả khi Esc/nút Đóng (người dùng) lẫn khi ta tự close() lúc photo thành null.
  // Chỉ trường hợp đầu cần báo lên URL.
  const handleClose = () => {
    if (open) onClose();
  };

  const move = (target) => {
    if (target) navigate({ search: hrefFor(target.id) }, { replace: true });
  };

  return (
    // Bấm nền tối để đóng chỉ là tiện ích cho chuột; người dùng bàn phím đã có Esc và nút Đóng (WCAG 2.1.1).
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={open ? titleId : undefined}
      onClose={handleClose}
      onClick={(event) => {
        // Chỉ bấm vào nền tối (chính phần tử dialog) mới đóng, bấm trong nội dung thì không.
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      {photo && (
        <div className={styles.body}>
          <button type="button" className={styles.close} onClick={() => dialogRef.current?.close()}>
            Đóng
          </button>
          <h2 id={titleId} className={styles.title}>
            {photo.title}
          </h2>
          <figure className={styles.figure}>
            <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} className={styles.image} />
            <figcaption>{photo.caption}</figcaption>
          </figure>
          {position && (
            <nav aria-label="Chuyển ảnh" className={styles.nav}>
              <button type="button" aria-disabled={prev ? undefined : 'true'} onClick={() => move(prev)}>
                Ảnh trước
              </button>
              <span>
                Ảnh {position.index + 1}/{position.total}
              </span>
              <button type="button" aria-disabled={next ? undefined : 'true'} onClick={() => move(next)}>
                Ảnh sau
              </button>
            </nav>
          )}
        </div>
      )}
    </dialog>
  );
}
