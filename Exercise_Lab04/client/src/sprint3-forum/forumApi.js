// Mọi lời gọi mạng của forum nằm ở file này (một chỗ duy nhất: thử thách "tự thử lại với backoff" chỉ sửa ở đây).
// Hợp đồng: shared/api-contract.md.

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

// Giới hạn trùng với server (validate.js) và shared/api-contract.md mục 4. Hai project độc lập nên không import chéo.
export const MAX_AUTHOR = 40;
export const MAX_TEXT = 500;

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} author
 * @property {string} text
 * @property {string} timestamp  ISO 8601
 */

const messagesUrl = (channel) => `${API_BASE}/api/channels/${encodeURIComponent(channel)}/messages`;

/**
 * GET danh sách tin của một kênh. Ném lỗi khi mã HTTP không ok (fetch chỉ reject khi lỗi mạng).
 * @param {string} channel
 * @param {AbortSignal} signal
 * @returns {Promise<Message[]>}
 */
export async function fetchMessages(channel, signal) {
  const res = await fetch(messagesUrl(channel), { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * POST một tin mới. Lỗi mang thông điệp của server (`{ error }`) nếu có.
 * @param {string} channel
 * @param {{ author: string, text: string }} payload
 * @returns {Promise<Message>}
 */
export async function sendMessage(channel, payload) {
  const res = await fetch(messagesUrl(channel), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// Ba kênh hợp lệ, trùng với server (store.js) và shared/api-contract.md. Thêm kênh phải sửa cả hai nơi.
export const CHANNELS = Object.freeze(['nasa', 'esports-tribunal', 'notNasa']);
