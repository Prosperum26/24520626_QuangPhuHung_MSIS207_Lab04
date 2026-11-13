// Giới hạn trùng với client (PostForm) và shared/api-contract.md mục 4. Hai project độc lập nên không import chéo.
export const MAX_AUTHOR = 40;
export const MAX_TEXT = 500;

/**
 * Kiểm tra payload POST. Trả { value } đã cắt khoảng trắng, hoặc { error } với thông báo đầu tiên.
 * id và timestamp (nếu client gửi) bị bỏ qua vì value chỉ lấy author và text.
 * @param {unknown} body
 * @returns {{ value: { author: string, text: string } } | { error: string }}
 */
export function validateMessage(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Body must be a JSON object' };
  }
  const { author, text } = /** @type {Record<string, unknown>} */ (body);

  if (typeof author !== 'string' || author.trim() === '') return { error: 'author is required' };
  if (typeof text !== 'string' || text.trim() === '') return { error: 'text is required' };

  const trimmedAuthor = author.trim();
  const trimmedText = text.trim();
  if (trimmedAuthor.length > MAX_AUTHOR) return { error: `author must be at most ${MAX_AUTHOR} characters` };
  if (trimmedText.length > MAX_TEXT) return { error: `text must be at most ${MAX_TEXT} characters` };

  return { value: { author: trimmedAuthor, text: trimmedText } };
}
