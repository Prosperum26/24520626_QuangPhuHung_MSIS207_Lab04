/** Lớp gọi API theo shared/appeal-api-contract.md. */

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3003';

/** Server trả lỗi có body `{ error, fields? }`. Lỗi mạng giữ nguyên TypeError của fetch. */
export class ApiError extends Error {
  /**
   * @param {number} status
   * @param {string} message
   * @param {Record<string, string>} [fields]
   */
  constructor(status, message, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, init) {
  const res = await fetch(`${API_BASE}${path}`, init);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error ?? `HTTP ${res.status}`, body?.fields);
  return body;
}

/** @param {{ signal?: AbortSignal }} [options] @returns {Promise<number>} giờ server (ms epoch) */
export async function fetchServerTime({ signal } = {}) {
  const { now } = await request('/api/time', { signal });
  return now;
}

/** @param {{ signal?: AbortSignal }} [options] */
export function fetchDossiers({ signal } = {}) {
  return request('/api/dossiers', { signal });
}

/** @param {string} id @param {{ signal?: AbortSignal }} [options] */
export function fetchDossier(id, { signal } = {}) {
  return request(`/api/dossiers/${encodeURIComponent(id)}`, { signal });
}

/**
 * @param {string} id
 * @param {import('../../../shared/appealRules.js').AppealInput} input
 */
export function submitAppeal(id, input) {
  return request(`/api/dossiers/${encodeURIComponent(id)}/appeals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}
