/**
 * @typedef {{ name: string, email: string, age: string, iq: string }} Values  (luôn là chuỗi, đúng với <input>)
 * @typedef {Partial<Record<keyof Values, string>>} Errors  (chỉ chứa field có lỗi)
 * @typedef {(value: string, allValues: Values) => string | null} Rule  (null khi hợp lệ)
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTEGER_PATTERN = /^\d+$/;
const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;

/** @type {Readonly<Values>} */
export const INITIAL_VALUES = Object.freeze({ name: '', email: '', age: '', iq: '' });

/** @type {Rule} */
function nameRule(value) {
  const name = value.trim();
  if (name === '') return 'Họ tên là bắt buộc';
  if (name.length < 2) return 'Họ tên cần ít nhất 2 ký tự';
  if (name.length > 60) return 'Họ tên tối đa 60 ký tự';
  return null;
}

/** @type {Rule} */
function emailRule(value) {
  const email = value.trim();
  if (email === '') return 'Email là bắt buộc';
  if (!EMAIL_PATTERN.test(email)) return 'Email chưa đúng định dạng';
  return null;
}

/** @type {Rule} */
function ageRule(value) {
  const age = value.trim();
  if (age === '') return 'Tuổi là bắt buộc';
  if (!INTEGER_PATTERN.test(age)) return 'Tuổi phải là số nguyên';
  if (Number(age) < 1 || Number(age) > 150) return 'Tuổi từ 1 đến 150';
  return null;
}

/** @type {Rule} */
function iqRule(value) {
  const iq = value.trim();
  if (iq === '') return 'IQ là bắt buộc';
  if (!DECIMAL_PATTERN.test(iq)) return 'IQ phải là số';
  if (Number(iq) < 50 || Number(iq) > 300) return 'IQ từ 50 đến 300';
  return null;
}

/**
 * Danh sách field và luật khai báo ở đúng một chỗ. Mỗi luật nhận (value, allValues)
 * để thêm luật chéo trường (vd. confirm password) chỉ là thêm một hàm vào đây.
 * @type {Readonly<Record<keyof Values, Rule>>}
 */
export const RULES = Object.freeze({
  name: nameRule,
  email: emailRule,
  age: ageRule,
  iq: iqRule,
});

/**
 * Hàm thuần: tính lỗi từ values, không state, không effect.
 * @param {Partial<Values>} values
 * @param {Readonly<Record<string, Rule>>} rules
 * @returns {Errors}
 */
export function evaluateErrors(values, rules) {
  /** @type {Record<string, string>} */
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const message = rule(values[field] ?? '', /** @type {Values} */ (values));
    if (message) errors[field] = message;
  }
  return errors;
}
