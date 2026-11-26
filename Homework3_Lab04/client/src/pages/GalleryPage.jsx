import { Link } from 'react-router';
import { PhotoLightbox } from '../components/PhotoLightbox.jsx';
import { CATEGORIES, PHOTOS } from '../data/photos.js';
import { filterPhotos, findPhoto, neighbors } from '../domain/gallery.js';
import { useGalleryParams } from '../hooks/useGalleryParams.js';
import styles from './GalleryPage.module.css';

const EAGER_COUNT = 4; // hàng ảnh đầu nằm trong màn hình đầu: tải ngay để LCP nhanh, phần còn lại lazy

/**
 * Trang gallery. Không có state riêng: danh mục và ảnh đang mở đều đọc từ URL (?category=&photoId=),
 * nên mọi trạng thái đều chia sẻ được bằng link và nút Back đóng được lightbox.
 */
export function GalleryPage() {
  const { category, photoId, searchFor, closePhoto } = useGalleryParams();

  // Dẫn xuất trong render.
  const visible = filterPhotos(PHOTOS, category);
  const photo = findPhoto(PHOTOS, photoId);
  const near = photo ? neighbors(visible, photo.id) : null;
  // Ảnh mở bằng link nằm ngoài danh mục đang lọc thì không có trước/sau.
  const inList = near !== null && near.index !== -1;
  const categoryLabel = CATEGORIES.find((c) => c.slug === category).label;

  return (
    <section aria-labelledby="gallery-title">
      <h2 id="gallery-title">Thư viện ảnh</h2>

      <nav aria-label="Lọc theo danh mục" className={styles.filters}>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to={{ search: searchFor({ category: c.slug === 'all' ? null : c.slug, photoId: null }) }}
            aria-current={c.slug === category ? 'true' : undefined}
            className={c.slug === category ? `${styles.filter} ${styles.selected}` : styles.filter}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      <p role="status">
        Hiển thị {visible.length} ảnh, danh mục {categoryLabel}
      </p>
      {photoId !== null && photo === null && (
        <p role="status" className={styles.notice}>
          Không tìm thấy ảnh &quot;{photoId}&quot;. <Link to={{ search: searchFor({ photoId: null }) }}>Xem toàn bộ ảnh</Link>
        </p>
      )}

      <ul className={styles.grid}>
        {visible.map((p, i) => (
          <li key={p.id}>
            <Link to={{ search: searchFor({ photoId: p.id }) }} className={styles.card}>
              <img
                src={p.src}
                alt=""
                width={p.width}
                height={p.height}
                loading={i < EAGER_COUNT ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : undefined}
                className={styles.thumb}
              />
              <span>{p.title}</span>
            </Link>
          </li>
        ))}
      </ul>

      <PhotoLightbox
        photo={photo}
        prev={inList ? near.prev : null}
        next={inList ? near.next : null}
        position={inList ? { index: near.index, total: near.total } : null}
        hrefFor={(id) => searchFor({ photoId: id })}
        onClose={closePhoto}
      />
    </section>
  );
}
