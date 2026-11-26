import { describe, expect, it } from 'vitest';
import { computeMatrix } from './matrix.js';

const make = (factors, kind = 'permanent') => ({ factors, sanction: { kind } });

describe('computeMatrix', () => {
  it('hồ sơ seed: giao hữu, luật không cấm rõ, không được báo, cấm vĩnh viễn → bất cân xứng', () => {
    const m = computeMatrix(make({ eventTier: 'exhibition', ruleExplicit: false, notified: false, priorOffenses: 0 }));
    expect(m.offenseSeverity).toBe(1);
    expect(m.sanctionSeverity).toBe(5);
    expect(m.ratio).toBe(5);
    expect(m.verdict).toBe('disproportionate');
    expect(m.rows).toHaveLength(4);
    expect(m.rows.map((r) => r.adjustment)).toEqual([-2, -1, -1, 0]);
  });

  it('giải chính thức, luật rõ, có báo trước, cấm vĩnh viễn → tương xứng', () => {
    const m = computeMatrix(make({ eventTier: 'official', ruleExplicit: true, notified: true, priorOffenses: 0 }));
    expect(m.offenseSeverity).toBe(5);
    expect(m.ratio).toBe(1);
    expect(m.verdict).toBe('proportionate');
  });

  it('kẹp mức hành vi trong [1, 5]', () => {
    const m = computeMatrix(make({ eventTier: 'official', ruleExplicit: true, notified: true, priorOffenses: 9 }, '1-year'));
    expect(m.offenseSeverity).toBe(5);
    expect(m.ratio).toBe(0.6);
  });

  it('ratio làm tròn 2 chữ số', () => {
    const m = computeMatrix(make({ eventTier: 'exhibition', ruleExplicit: true, notified: true, priorOffenses: 0 }, 'match-ban'));
    expect(m.offenseSeverity).toBe(3);
    expect(m.ratio).toBe(0.67);
  });

  it('hồ sơ null thì null', () => {
    expect(computeMatrix(null)).toBeNull();
  });
});
