/**
 * Dữ liệu gallery. Mọi ảnh là SVG minh họa tự sinh (scripts/generate-photos.mjs), không phải ảnh thật.
 * @typedef {'all'|'scene'|'document'|'chart'} CategorySlug
 * @typedef {{ slug: CategorySlug, label: string }} Category
 * @typedef {{ id: string, category: Exclude<CategorySlug, 'all'>, title: string, alt: string, caption: string, src: string, width: 600, height: 400 }} Photo
 */

/** @type {readonly Category[]} */
export const CATEGORIES = Object.freeze([
  { slug: 'all', label: 'Tất cả' },
  { slug: 'scene', label: 'Hiện trường' },
  { slug: 'document', label: 'Tài liệu' },
  { slug: 'chart', label: 'Biểu đồ' },
]);

const RAW = [
  ['scene', 'Hiện trường 1: phòng thi đấu', 'Minh họa phòng thi đấu với nền xanh dương và các khối hình chữ nhật xếp hàng'],
  ['scene', 'Hiện trường 2: khu vực khán giả', 'Minh họa khu vực khán giả với các hình tròn nhỏ trên nền xanh dương'],
  ['scene', 'Hiện trường 3: quầy kỹ thuật', 'Minh họa quầy kỹ thuật với một dải ngang và hai hình vuông trên nền xanh dương'],
  ['scene', 'Hiện trường 4: sân khấu chính', 'Minh họa sân khấu chính với hình tam giác lớn ở giữa trên nền xanh dương'],
  ['document', 'Tài liệu 1: biên bản họp', 'Minh họa biên bản họp với các dòng kẻ ngang trên nền xanh lá'],
  ['document', 'Tài liệu 2: bản giải trình', 'Minh họa bản giải trình với khối chữ nhật lớn và dòng kẻ trên nền xanh lá'],
  ['document', 'Tài liệu 3: thư thông báo', 'Minh họa thư thông báo với một hình chữ nhật nghiêng trên nền xanh lá'],
  ['document', 'Tài liệu 4: bảng quy định', 'Minh họa bảng quy định với lưới ô vuông trên nền xanh lá'],
  ['chart', 'Biểu đồ 1: lượt xem theo ngày', 'Minh họa biểu đồ cột tăng dần trên nền cam'],
  ['chart', 'Biểu đồ 2: tỉ lệ phản hồi', 'Minh họa biểu đồ tròn chia hai phần trên nền cam'],
  ['chart', 'Biểu đồ 3: dòng thời gian', 'Minh họa đường gấp khúc đi lên trên nền cam'],
  ['chart', 'Biểu đồ 4: so sánh mức độ', 'Minh họa hai cột cao thấp cạnh nhau trên nền cam'],
];

/** @type {readonly Photo[]} */
export const PHOTOS = Object.freeze(
  RAW.map(([category, title, alt], i) => {
    const id = `p${String(i + 1).padStart(2, '0')}`;
    return Object.freeze({
      id,
      category,
      title,
      alt,
      caption: `Ảnh minh họa ${id}, tự sinh cho bài tập, không phải bằng chứng thật.`,
      src: `/photos/${id}.svg`,
      width: 600,
      height: 400,
    });
  }),
);
