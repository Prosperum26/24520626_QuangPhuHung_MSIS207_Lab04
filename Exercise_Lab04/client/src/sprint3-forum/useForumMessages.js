import { useEffect, useState } from 'react';
import { fetchMessages, sendMessage } from './forumApi.js';

const EMPTY = Object.freeze([]);
// channel = null nghĩa là "chưa có kết quả cho kênh nào" nên status luôn là 'loading'.
const NO_RESULT = Object.freeze({ channel: null, messages: EMPTY, error: null });

/**
 * Tin nhắn của một kênh. `status` được DẪN XUẤT: kết quả lưu kèm tên kênh, nếu khác kênh hiện tại
 * thì là 'loading'. Vì vậy không cần setState('loading') ở đầu effect, và tin của kênh cũ không bao giờ
 * hiện cho kênh mới.
 * @param {string} channel
 * @returns {{
 *   messages: readonly import('./forumApi.js').Message[],
 *   status: 'loading' | 'success' | 'error',
 *   error: Error | null,
 *   postMessage: (payload: { author: string, text: string }) => Promise<void>,
 *   retry: () => void,
 * }}
 */
export function useForumMessages(channel) {
  const [result, setResult] = useState(NO_RESULT);
  // Tăng lên để tải lại (sau khi gửi tin, hoặc bấm thử lại).
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      try {
        const messages = await fetchMessages(channel, signal);
        if (!signal.aborted) setResult({ channel, messages, error: null });
      } catch (error) {
        // Bị huỷ (đổi kênh hoặc unmount) thì bỏ qua, kể cả AbortError.
        if (!signal.aborted) setResult({ channel, messages: EMPTY, error });
      }
    })();

    return () => controller.abort();
  }, [channel, reloadKey]);

  const settled = result.channel === channel;
  const status = !settled ? 'loading' : result.error ? 'error' : 'success';

  async function postMessage(payload) {
    await sendMessage(channel, payload); // ném lỗi nếu server từ chối; không tải lại
    setReloadKey((key) => key + 1); // tin cũ vẫn hiện trong lúc tải lại
  }

  function retry() {
    setResult(NO_RESULT);
    setReloadKey((key) => key + 1);
  }

  return {
    messages: settled ? result.messages : EMPTY,
    status,
    error: settled ? result.error : null,
    postMessage,
    retry,
  };
}
