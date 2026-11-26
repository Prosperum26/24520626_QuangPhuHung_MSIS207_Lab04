import { vi } from 'vitest';
import { evaluateErrors, toAppeal } from '../../../shared/appealRules.js';

/** Hồ sơ mẫu cho test, đúng dạng Dossier của contract (chưa có appealDeadline, appeal). */
export function dossier(id, name) {
  return {
    id,
    name,
    realName: `Tên thật ${name}`,
    summary: `Tóm tắt ${name}`,
    accusation: 'Bị cáo buộc dùng thông tin ngoài trận',
    sanction: { issuer: 'KRAFTON', issuedAt: '2026-09-23', kind: 'permanent', scope: 'Mọi giải đấu' },
    factors: { eventTier: 'exhibition', ruleExplicit: false, notified: false, priorOffenses: 0 },
    sources: [{ title: `Nguồn ${name}`, url: `https://example.com/${id}` }],
  };
}

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const abortError = () => new DOMException('The operation was aborted.', 'AbortError');

/**
 * Giả cả 4 route của contract bằng vi.stubGlobal('fetch'). Giờ server = Date.now() + serverOffsetMs,
 * hạn SLA = giờ server lúc cài + deadlineInMs.
 * - state.hold = true: request treo tới khi gọi release().
 * - state.fail = 500 | 'network': request kế tiếp lỗi theo kiểu đó.
 * @param {{ serverOffsetMs?: number, deadlineInMs?: number, dossiers?: object[] }} [options]
 */
export function installFakeAppealServer({
  serverOffsetMs = 0,
  deadlineInMs = 3_600_000,
  dossiers = [dossier('himass', 'Himass'), dossier('tanvuu', 'TanVuu')],
} = {}) {
  const serverNow = () => Date.now() + serverOffsetMs;
  const appealDeadline = serverNow() + deadlineInMs;
  const db = { dossiers: dossiers.map((d) => ({ ...d, appealDeadline, appeal: null })) };
  const state = { hold: false, fail: null };
  /** @type {{ method: string, path: string, signal?: AbortSignal }[]} */
  const requests = [];
  const pending = [];

  function route(method, path, body) {
    if (state.fail === 500) return json(500, { error: 'Internal server error' });
    if (method === 'GET' && path === '/api/time') return json(200, { now: serverNow() });
    if (method === 'GET' && path === '/api/dossiers') {
      return json(200, db.dossiers.map((d) => ({ id: d.id, name: d.name, appealDeadline: d.appealDeadline, hasAppeal: d.appeal !== null })));
    }
    const match = path.match(/^\/api\/dossiers\/([^/]+)(\/appeals)?$/);
    if (!match) return json(404, { error: 'Not found' });
    const found = db.dossiers.find((d) => d.id === decodeURIComponent(match[1]));
    if (!found) return json(404, { error: 'Dossier not found' });
    if (method === 'GET' && !match[2]) return json(200, structuredClone(found));
    if (method === 'POST' && match[2]) {
      const fields = evaluateErrors(body);
      if (Object.keys(fields).length > 0) return json(400, { error: 'Validation failed', fields });
      if (serverNow() >= found.appealDeadline) return json(409, { error: 'Appeal window closed' });
      if (found.appeal) return json(409, { error: 'Appeal already submitted' });
      found.appeal = { ...toAppeal(body), id: `a-${found.id}`, playerId: found.id, submittedAt: serverNow() };
      return json(201, structuredClone(found.appeal));
    }
    return json(404, { error: 'Not found' });
  }

  const fetchMock = vi.fn((url, init = {}) => {
    const method = init.method ?? 'GET';
    const path = new URL(url).pathname;
    const { signal } = init;
    requests.push({ method, path, signal });
    if (signal?.aborted) return Promise.reject(abortError());
    if (state.fail === 'network') return Promise.reject(new TypeError('Failed to fetch'));
    const body = init.body ? JSON.parse(init.body) : undefined;
    const respond = () => route(method, path, body);
    if (!state.hold) return Promise.resolve(respond());
    return new Promise((resolve, reject) => {
      signal?.addEventListener('abort', () => reject(abortError()));
      pending.push(() => resolve(respond()));
    });
  });
  vi.stubGlobal('fetch', fetchMock);

  return {
    db,
    state,
    requests,
    /** @returns {string[]} dạng 'GET /api/time' */
    calls: () => requests.map((r) => `${r.method} ${r.path}`),
    release() {
      state.hold = false;
      for (const resolve of pending.splice(0)) resolve();
    },
  };
}
