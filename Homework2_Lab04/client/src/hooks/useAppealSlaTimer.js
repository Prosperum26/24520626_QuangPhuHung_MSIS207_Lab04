import { useEffect, useState } from 'react';
import { fetchServerTime } from '../api/appealApi.js';
import { estimateOffset } from '../domain/clock.js';

const TICK_MS = 200;

/**
 * Đếm ngược tới hạn kháng cáo, không trôi:
 * - Thời gian còn lại luôn tính lại từ mốc tuyệt đối: deadline - (giờ máy + độ lệch server).
 *   Không bao giờ trừ dần, nên interval bị throttle ở tab nền cũng không làm lệch.
 * - Độ lệch (system clock delta) đo bằng GET /api/time lúc mount và mỗi khi tab hiện lại.
 * - Khi tab hiện lại thì tính lại ngay, không chờ tick kế tiếp.
 * @param {number} deadlineMs hạn SLA theo giờ server (ms epoch)
 * @returns {{ remainingMs: number, expired: boolean, synced: boolean }}
 */
export function useAppealSlaTimer(deadlineMs) {
  const [now, setNow] = useState(Date.now);
  const [clock, setClock] = useState({ offsetMs: 0, synced: false });
  const [syncRound, setSyncRound] = useState(0);

  // Đo độ lệch đồng hồ với server. Lỗi thì giữ độ lệch cũ (lần đầu là 0).
  useEffect(() => {
    const controller = new AbortController();
    const sentAt = Date.now();
    fetchServerTime({ signal: controller.signal })
      .then((serverNow) => {
        if (controller.signal.aborted) return;
        setClock({ offsetMs: estimateOffset({ serverNow, sentAt, receivedAt: Date.now() }), synced: true });
      })
      .catch(() => {
        // Không đồng bộ được: vẫn đếm theo giờ máy, synced giữ nguyên để UI ghi chú.
      });
    return () => controller.abort();
  }, [syncRound]);

  // Nhịp đồng hồ + Page Visibility API.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const resyncTimerWithServer = () => setSyncRound((n) => n + 1);
    const timerId = window.setInterval(tick, TICK_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
        resyncTimerWithServer();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(timerId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  // Dẫn xuất trong render từ mốc tuyệt đối.
  const remainingMs = Math.max(0, deadlineMs - (now + clock.offsetMs));
  // Chưa đo được độ lệch thì không kết luận hết hạn theo giờ máy (máy có thể chạy nhanh);
  // server vẫn chặn đơn quá hạn bằng 409.
  return { remainingMs, expired: clock.synced && remainingMs === 0, synced: clock.synced };
}
