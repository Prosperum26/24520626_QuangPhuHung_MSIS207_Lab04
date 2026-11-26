/**
 * Lớp gọi API của Swipe Deck. Contract: shared/swipe-api-contract.md.
 * @typedef {{ id: string, name: string, age: number, gender: 'male'|'female', bio: string }} Profile
 * @typedef {{ id: string, gameId: string, profileId: string, direction: 'left'|'right'|'up', createdAt: string }} Swipe
 * @typedef {{ game: { id: string, createdAt: string }, swipes: Swipe[] }} GameState
 */

const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3002';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** Lỗi HTTP từ server: `status` là mã HTTP, `message` lấy từ `{ error }` của body. */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Kiểm res.ok trước khi tin body; lỗi mạng và AbortError được ném lại nguyên vẹn. */
async function request(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, init);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error ?? `HTTP ${res.status}`);
  return body;
}

/** @returns {Promise<Profile[]>} */
export const fetchProfiles = ({ signal } = {}) => request('/api/profiles', { signal });

/** @returns {Promise<GameState>} */
export const fetchCurrentGame = ({ signal } = {}) => request('/api/games/current', { signal });

/** @returns {Promise<GameState>} */
export const createGame = () => request('/api/games', { method: 'POST' });

/** @returns {Promise<Swipe>} */
export const postSwipe = (gameId, { profileId, direction }) =>
  request(`/api/games/${encodeURIComponent(gameId)}/swipes`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ profileId, direction }),
  });

/** Hoàn tác LIFO trên server. @returns {Promise<Swipe>} */
export const deleteLastSwipe = (gameId) =>
  request(`/api/games/${encodeURIComponent(gameId)}/swipes/last`, { method: 'DELETE' });
