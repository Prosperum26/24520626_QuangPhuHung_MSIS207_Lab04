import { useSearchParams } from 'react-router';
import { parseCategory, withParams } from '../domain/gallery.js';

/**
 * Trạng thái gallery nằm hoàn toàn trong URL: ?category=&photoId=. Không có useState.
 * - selectCategory: push, đồng thời xóa photoId.
 * - closePhoto: replace, chỉ xóa photoId (mẫu slide setSearchParams({}) xóa luôn cả category).
 * @returns {{
 *   category: import('../data/photos.js').CategorySlug,
 *   photoId: string | null,
 *   searchFor: (patch: Record<string, string | null>) => string,
 *   selectCategory: (slug: import('../data/photos.js').CategorySlug) => void,
 *   closePhoto: () => void,
 * }}
 */
export function useGalleryParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = parseCategory(searchParams.get('category'));
  const photoId = searchParams.get('photoId');

  const searchFor = (patch) => {
    const text = withParams(searchParams, patch).toString();
    return text ? `?${text}` : '';
  };

  const selectCategory = (slug) => {
    setSearchParams(withParams(searchParams, { category: slug === 'all' ? null : slug, photoId: null }));
  };

  const closePhoto = () => {
    if (photoId === null) return;
    setSearchParams(withParams(searchParams, { photoId: null }), { replace: true });
  };

  return { category, photoId, searchFor, selectCategory, closePhoto };
}
