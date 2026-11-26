/**
 * Luật validation đơn kháng cáo, dùng chung cho client (form real-time) và server (kiểm lại khi nhận).
 * Hàm thuần, không import gì. Server nhận JSON tuỳ ý nên mọi luật phải chịu được giá trị sai kiểu.
 *
 * @typedef {'friendly-match'|'no-explicit-rule'|'not-notified'|'disproportionate'} Ground
 * @typedef {{ email: string, grounds: Ground[], statement: string, evidenceUrl: string, confirm: boolean }} AppealInput
 * @typedef {Partial<Record<keyof AppealInput, string>>} Errors
 * @typedef {(value: unknown, allValues: Partial<AppealInput>) => string | null} Rule
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATEMENT_MIN = 100;
export const STATEMENT_MAX = 2000;

/** @type {Readonly<Record<Ground, string>>} */
export const GROUNDS = Object.freeze({
  'friendly-match': 'Đây là giải giao hữu, không phải giải chính thức',
  'no-explicit-rule': 'Luật giải không cấm rõ hành vi bị cáo buộc',
  'not-notified': 'Tuyển thủ không được thông báo về thay đổi luật',
  disproportionate: 'Mức án không tương xứng với hành vi',
});

/** @type {Readonly<AppealInput>} */
export const INITIAL_VALUES = Object.freeze({ email: '', grounds: [], statement: '', evidenceUrl: '', confirm: false });

const text = (value) => (typeof value === 'string' ? value.trim() : '');

/** @type {Rule} */
function emailRule(value) {
  const email = text(value);
  if (email === '') return 'Email là bắt buộc';
  if (!EMAIL_PATTERN.test(email)) return 'Email chưa đúng định dạng';
  return null;
}

/** @type {Rule} */
function groundsRule(value) {
  if (!Array.isArray(value) || value.length === 0) return 'Chọn ít nhất một căn cứ';
  if (!value.every((g) => typeof g === 'string' && Object.hasOwn(GROUNDS, g))) return 'Căn cứ không hợp lệ';
  return null;
}

/** @type {Rule} */
function statementRule(value) {
  const statement = text(value);
  if (statement === '') return 'Bản giải trình là bắt buộc';
  if (statement.length < STATEMENT_MIN) return `Bản giải trình cần ít nhất ${STATEMENT_MIN} ký tự`;
  if (statement.length > STATEMENT_MAX) return `Bản giải trình tối đa ${STATEMENT_MAX} ký tự`;
  return null;
}

/** @type {Rule} */
function evidenceUrlRule(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return 'Link bằng chứng phải là URL https';
  const url = value.trim();
  if (url === '') return null;
  if (!URL.canParse(url) || new URL(url).protocol !== 'https:') return 'Link bằng chứng phải là URL https';
  return null;
}

/** @type {Rule} */
function confirmRule(value) {
  return value === true ? null : 'Cần xác nhận thông tin là đúng sự thật';
}

/** @type {Readonly<Record<keyof AppealInput, Rule>>} */
export const RULES = Object.freeze({
  email: emailRule,
  grounds: groundsRule,
  statement: statementRule,
  evidenceUrl: evidenceUrlRule,
  confirm: confirmRule,
});

/** Thứ tự field trên form: field lỗi đầu tiên theo thứ tự này được focus khi bấm Nộp. */
export const FIELD_ORDER = Object.freeze(Object.keys(RULES));

/**
 * @param {Partial<AppealInput>} values
 * @param {Readonly<Record<string, Rule>>} [rules]
 * @returns {Errors}
 */
export function evaluateErrors(values, rules = RULES) {
  /** @type {Record<string, string>} */
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const message = rule(values?.[field], values);
    if (message) errors[field] = message;
  }
  return errors;
}

/**
 * Chuẩn hoá values đã hợp lệ thành AppealInput: cắt khoảng trắng, bỏ field lạ.
 * @param {AppealInput} values
 * @returns {AppealInput}
 */
export function toAppeal(values) {
  return {
    email: text(values.email),
    grounds: [...values.grounds],
    statement: text(values.statement),
    evidenceUrl: text(values.evidenceUrl),
    confirm: values.confirm === true,
  };
}
