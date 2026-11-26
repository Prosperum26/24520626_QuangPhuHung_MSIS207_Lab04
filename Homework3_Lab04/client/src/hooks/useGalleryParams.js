import { useSearchParams } from 'react-router';
import { parseCategory, withParams } from '../domain/gallery.js';

/**
 * Trạng thái gallery nằm hoàn toàn trong URL: ?category=&photoId=. Không có useState.
 * - closePhoto: replace, chỉ xóa photoId (mẫu slide setSearchParams({}) xóa luôn cả category).
 * @returns {{
 *   category: import('../data/photos.js').CategorySlug,
 *   photoId: string | null,
 *   searchFor: (patch: Record<string, string | null>) => string,
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


  const closePhoto = () => {
    if (photoId === null) return;
    setSearchParams(withParams(searchParams, { photoId: null }), { replace: true });
  };

  return { category, photoId, searchFor, closePhoto };
}
