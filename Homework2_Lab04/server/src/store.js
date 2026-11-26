import { randomUUID } from 'node:crypto';
import { SEED_DOSSIERS } from './dossiers.js';

const HOUR_MS = 3_600_000;
export const DEFAULT_SLA_HOURS = 48;

/**
 * Kho trong bộ nhớ. Hạn SLA là mốc tuyệt đối tính một lần lúc tạo store, nên mọi client
 * (và mọi lần F5) thấy cùng một hạn; khởi động lại server thì hạn được tính lại.
 * @param {{ now?: () => number, slaHours?: number }} [options]
 */
export function createStore({ now = Date.now, slaHours = DEFAULT_SLA_HOURS } = {}) {
  const hours = Number.isFinite(slaHours) && slaHours > 0 ? slaHours : DEFAULT_SLA_HOURS;
  const appealDeadline = now() + hours * HOUR_MS;
  const dossiers = new Map(SEED_DOSSIERS.map((d) => [d.id, structuredClone({ ...d, appealDeadline, appeal: null })]));

  return {
    listDossiers() {
      return [...dossiers.values()].map(({ id, name, appealDeadline: deadline, appeal }) => ({
        id,
        name,
        appealDeadline: deadline,
        hasAppeal: appeal !== null,
      }));
    },

    /** @param {string} id */
    getDossier(id) {
      const dossier = dossiers.get(id);
      return dossier ? structuredClone(dossier) : null;
    },

    /**
     * Gọi sau khi route đã kiểm hồ sơ tồn tại, input hợp lệ, còn hạn và chưa nộp.
     * @param {string} id
     * @param {import('../../shared/appealRules.js').AppealInput} input
     */
    addAppeal(id, input) {
      const dossier = dossiers.get(id);
      dossier.appeal = { ...structuredClone(input), id: randomUUID(), playerId: id, submittedAt: now() };
      return structuredClone(dossier.appeal);
    },
  };
}
