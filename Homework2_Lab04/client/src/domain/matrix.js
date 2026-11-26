/**
 * Ma trận bất cân xứng: so mức án với mức hành vi đã điều chỉnh theo các yếu tố của vụ việc.
 * Đây là mô hình chấm điểm cho bài tập, không phải đánh giá pháp lý.
 */

const BASE_OFFENSE = 5;
const MIN_SEVERITY = 1;
const MAX_SEVERITY = 5;
const DISPROPORTION_THRESHOLD = 1.5;

/** Mức nặng của từng loại án, thang 1 đến 5. */
export const SANCTION_SEVERITY = Object.freeze({ warning: 1, 'match-ban': 2, '1-year': 3, permanent: 5 });

export const SANCTION_LABEL = Object.freeze({
  warning: 'Cảnh cáo',
  'match-ban': 'Cấm một trận',
  '1-year': 'Cấm 1 năm',
  permanent: 'Cấm vĩnh viễn',
});

const yesNo = (value) => (value ? 'Có' : 'Không');

/** Mỗi tiêu chí: nhãn, giá trị hiển thị, và điểm điều chỉnh mức hành vi. */
const CRITERIA = [
  {
    id: 'eventTier',
    label: 'Loại giải',
    value: (f) => (f.eventTier === 'exhibition' ? 'Giao hữu' : 'Chính thức'),
    adjustment: (f) => (f.eventTier === 'exhibition' ? -2 : 0),
  },
  { id: 'ruleExplicit', label: 'Luật giải cấm rõ hành vi', value: (f) => yesNo(f.ruleExplicit), adjustment: (f) => (f.ruleExplicit ? 0 : -1) },
  { id: 'notified', label: 'Được thông báo thay đổi luật', value: (f) => yesNo(f.notified), adjustment: (f) => (f.notified ? 0 : -1) },
  { id: 'priorOffenses', label: 'Số vi phạm trước đó', value: (f) => String(f.priorOffenses), adjustment: (f) => f.priorOffenses },
];

const clamp = (n) => Math.min(MAX_SEVERITY, Math.max(MIN_SEVERITY, n));
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Hàm thuần, gọi trong render qua useMemo.
 * @param {{ factors: { eventTier: 'exhibition'|'official', ruleExplicit: boolean, notified: boolean, priorOffenses: number }, sanction: { kind: keyof typeof SANCTION_SEVERITY } } | null} dossier
 */
export function computeMatrix(dossier) {
  if (!dossier) return null;
  const { factors, sanction } = dossier;
  const rows = CRITERIA.map((c) => ({ id: c.id, label: c.label, value: c.value(factors), adjustment: c.adjustment(factors) }));
  const offenseSeverity = clamp(rows.reduce((sum, r) => sum + r.adjustment, BASE_OFFENSE));
  const sanctionSeverity = SANCTION_SEVERITY[sanction.kind];
  const ratio = round2(sanctionSeverity / offenseSeverity);
  return {
    rows,
    offenseSeverity,
    sanctionSeverity,
    ratio,
    verdict: ratio >= DISPROPORTION_THRESHOLD ? 'disproportionate' : 'proportionate',
  };
}
