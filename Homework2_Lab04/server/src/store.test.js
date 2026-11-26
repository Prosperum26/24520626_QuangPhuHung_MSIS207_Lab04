import { describe, expect, it } from 'vitest';
import { createStore } from './store.js';

const START = Date.UTC(2026, 10, 26, 12, 0, 0);
const HOUR = 3_600_000;
const INPUT = { email: 'a@b.vn', grounds: ['friendly-match'], statement: 'a'.repeat(100), evidenceUrl: '', confirm: true };

function setup(options = {}) {
  let now = START;
  const clock = { now: () => now, set: (t) => { now = t; } };
  return { clock, store: createStore({ now: clock.now, ...options }) };
}

describe('createStore', () => {
  it('hạn SLA cố định = lúc tạo store + 48 giờ', () => {
    const { store, clock } = setup();
    clock.set(START + 5 * HOUR);
    expect(store.getDossier('himass').appealDeadline).toBe(START + 48 * HOUR);
  });

  it('slaHours không phải số dương thì dùng 48', () => {
    for (const slaHours of [0, -1, Number.NaN, undefined]) {
      expect(setup({ slaHours }).store.getDossier('tanvuu').appealDeadline).toBe(START + 48 * HOUR);
    }
    expect(setup({ slaHours: 0.5 }).store.getDossier('tanvuu').appealDeadline).toBe(START + 0.5 * HOUR);
  });

  it('id lạ thì null', () => {
    expect(setup().store.getDossier('nope')).toBeNull();
  });

  it('listDossiers trả tóm tắt', () => {
    expect(setup().store.listDossiers()).toEqual([
      { id: 'himass', name: 'Himass', appealDeadline: START + 48 * HOUR, hasAppeal: false },
      { id: 'tanvuu', name: 'TanVuu', appealDeadline: START + 48 * HOUR, hasAppeal: false },
    ]);
  });

  it('hồ sơ có đủ dữ kiện và nguồn', () => {
    const dossier = setup().store.getDossier('himass');
    expect(dossier).toMatchObject({
      realName: 'Lã Phương Tiến Đạt',
      sanction: { issuer: 'KRAFTON', issuedAt: '2026-09-23', kind: 'permanent' },
      factors: { eventTier: 'exhibition', ruleExplicit: false, notified: false, priorOffenses: 0 },
      appeal: null,
    });
    expect(dossier.sources.length).toBeGreaterThanOrEqual(3);
    expect(dossier.sources.every((s) => s.url.startsWith('https://'))).toBe(true);
  });

  it('addAppeal lưu đơn kèm meta', () => {
    const { store, clock } = setup();
    clock.set(START + HOUR);
    const appeal = store.addAppeal('himass', INPUT);
    expect(appeal).toMatchObject({ ...INPUT, playerId: 'himass', submittedAt: START + HOUR });
    expect(typeof appeal.id).toBe('string');
    expect(store.getDossier('himass').appeal).toEqual(appeal);
    expect(store.listDossiers()[0].hasAppeal).toBe(true);
    expect(store.getDossier('tanvuu').appeal).toBeNull();
  });

  it('sửa object trả ra không làm đổi store', () => {
    const { store } = setup();
    store.getDossier('himass').sanction.kind = 'warning';
    expect(store.getDossier('himass').sanction.kind).toBe('permanent');
  });
});
