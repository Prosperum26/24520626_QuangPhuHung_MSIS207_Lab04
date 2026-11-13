import { randomUUID } from 'node:crypto';

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} author
 * @property {string} text
 * @property {string} timestamp  ISO 8601
 */

// Ba kênh hợp lệ (xem shared/api-contract.md). Thêm kênh chỉ cần sửa đây.
export const CHANNELS = Object.freeze(['nasa', 'esports-tribunal', 'notNasa']);

const SEED = {
  nasa: [
    ['Katherine', 'Quỹ đạo Artemis đã được tính lại, ai xem giúp mình?', '2026-11-01T08:00:00.000Z'],
    ['Neil', 'Cửa sổ phóng tuần sau thời tiết đẹp.', '2026-11-01T08:05:00.000Z'],
    ['Sally', 'Telemetry ổn định, không có cảnh báo.', '2026-11-01T08:12:00.000Z'],
  ],
  'esports-tribunal': [
    ['Himass', 'Hồ sơ kháng cáo đã nộp đủ chứng cứ.', '2026-11-02T09:00:00.000Z'],
    ['TanVuu', 'Cần đối chiếu log trận 3 trước khi phán quyết.', '2026-11-02T09:07:00.000Z'],
  ],
  notNasa: [
    ['Hung', 'Kênh này không liên quan gì đến NASA cả.', '2026-11-03T10:00:00.000Z'],
    ['Lan', 'Đúng rồi, ở đây chỉ nói chuyện linh tinh.', '2026-11-03T10:03:00.000Z'],
  ],
};

/**
 * Kho tin nhắn trong bộ nhớ (mất khi khởi động lại). Dùng factory để mỗi test có kho riêng.
 * @returns {{
 *   getMessages: (channel: string) => Message[] | undefined,
 *   addMessage: (channel: string, input: { author: string, text: string }) => Message | undefined,
 * }}
 */
export function createStore() {
  /** @type {Map<string, Message[]>} */
  const channels = new Map(
    CHANNELS.map((channel) => [
      channel,
      SEED[channel].map(([author, text, timestamp]) => ({ id: randomUUID(), author, text, timestamp })),
    ]),
  );

  return {
    getMessages(channel) {
      const messages = channels.get(channel);
      return messages ? [...messages] : undefined;
    },
    addMessage(channel, { author, text }) {
      const messages = channels.get(channel);
      if (!messages) return undefined;
      const message = { id: randomUUID(), author, text, timestamp: new Date().toISOString() };
      messages.push(message);
      return message;
    },
  };
}
