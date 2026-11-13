// Dữ liệu people.json sao chép từ Lab03 Ex2 (src/data/people.json). Chỉnh ở people.json, không chỉnh ở đây.
import people from './people.json';

/**
 * @typedef {Object} Person
 * @property {string} id    chuỗi (useParams luôn trả chuỗi nên so sánh cùng kiểu)
 * @property {string} name
 * @property {number} age
 * @property {number} iq
 */

/** @type {readonly Person[]} */
export const PEOPLE = Object.freeze(people.map((person) => Object.freeze({ ...person })));
