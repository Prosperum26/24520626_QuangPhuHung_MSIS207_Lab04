import { MAX_AUTHOR, MAX_TEXT } from './forumApi.js';

/**
 * Kiểm tra tin trước khi gửi, khớp với server (server/src/validate.js): bắt buộc, giới hạn độ dài sau trim.
 * Hàm thuần, tính trong render; chỉ trả field có lỗi.
 * @param {{ author: string, text: string }} values
 * @returns {{ author?: string, text?: string }}
 */
export function validatePost({ author, text }) {
  const errors = {};
  const trimmedAuthor = author.trim();
  const trimmedText = text.trim();

  if (trimmedAuthor === '') errors.author = 'Tên là bắt buộc';
  else if (trimmedAuthor.length > MAX_AUTHOR) errors.author = `Tên tối đa ${MAX_AUTHOR} ký tự`;

  if (trimmedText === '') errors.text = 'Nội dung là bắt buộc';
  else if (trimmedText.length > MAX_TEXT) errors.text = `Nội dung tối đa ${MAX_TEXT} ký tự`;

  return errors;
}
