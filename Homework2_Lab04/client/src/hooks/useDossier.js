import { useEffect, useState } from 'react';
import { ApiError, fetchDossier } from '../api/appealApi.js';

/** Câu báo lỗi cho người dùng. */
export function describeError(err) {
  if (err instanceof ApiError) return `Server báo lỗi: ${err.message}`;
  return 'Không kết nối được server. Kiểm tra server rồi bấm Thử lại.';
}

/**
 * Tải một hồ sơ theo id. Kết quả lưu kèm khoá request, nên khi id đổi thì `loading` được dẫn xuất
 * ngay trong render và không bao giờ trả hồ sơ cũ dưới id mới (request cũ bị abort).
 * @param {string} playerId
 */
export function useDossier(playerId) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, status: 'loading', dossier: null, error: null });
  const key = `${playerId}#${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    fetchDossier(playerId, { signal })
      .then((dossier) => {
        if (!signal.aborted) setResult({ key, status: 'ready', dossier, error: null });
      })
      .catch((err) => {
        if (signal.aborted || err.name === 'AbortError') return;
        const notFound = err instanceof ApiError && err.status === 404;
        setResult({ key, status: notFound ? 'not-found' : 'error', dossier: null, error: notFound ? null : describeError(err) });
      });
    return () => controller.abort();
  }, [playerId, key]);

  const current = result.key === key;
  // Chỉ gắn đơn vào đúng hồ sơ của nó: POST về muộn sau khi đã sang hồ sơ khác thì bỏ qua.
  const setAppeal = (appeal) =>
    setResult((prev) =>
      prev.dossier && prev.dossier.id === appeal.playerId ? { ...prev, dossier: { ...prev.dossier, appeal } } : prev,
    );

  return {
    status: current ? result.status : 'loading',
    dossier: current ? result.dossier : null,
    error: current ? result.error : null,
    retry: () => setAttempt((n) => n + 1),
    setAppeal,
  };
}
