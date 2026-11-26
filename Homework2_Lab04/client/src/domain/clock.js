/** Hàm thuần cho đồng hồ SLA. */

/**
 * Độ lệch đồng hồ máy so với server, giả định đường đi và đường về mất thời gian như nhau.
 * Giờ server ước lượng = Date.now() + offset.
 * @param {{ serverNow: number, sentAt: number, receivedAt: number }} sample
 */
export function estimateOffset({ serverNow, sentAt, receivedAt }) {
  return serverNow - (sentAt + receivedAt) / 2;
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * Định dạng HH:MM:SS (giờ không giới hạn 24). Làm tròn lên giây để chỉ hiện 00:00:00 khi đã hết hạn thật.
 * @param {number} ms
 */
export function formatRemaining(ms) {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(total % 60)}`;
}
