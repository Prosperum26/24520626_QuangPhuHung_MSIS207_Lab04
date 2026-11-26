import { createContext, useContext } from 'react';

/**
 * @typedef {import('../../../shared/appealRules.js').AppealInput} AppealInput
 * @typedef {import('../../../shared/appealRules.js').Errors} Errors
 * @typedef {Object} AppealFormState
 * @property {AppealInput} values
 * @property {Errors} errors         mọi lỗi phía client (tính trong render)
 * @property {Errors} visibleErrors  lỗi được hiện: field đã chạm (hoặc tất cả sau khi bấm Nộp) + lỗi server trả về
 * @property {boolean} isValid
 * @property {boolean} submitted
 * @property {boolean} disabled
 * @property {<K extends keyof AppealInput>(field: K, value: AppealInput[K]) => void} setValue
 * @property {(field: keyof AppealInput) => void} touch
 * @property {() => void} markSubmitted
 * @property {(fields: Errors) => void} setServerErrors
 */

/** @type {import('react').Context<AppealFormState | null>} */
export const AppealFormContext = createContext(null);

/** @returns {AppealFormState} */
export function useAppealForm() {
  const state = useContext(AppealFormContext);
  if (!state) throw new Error('useAppealForm must be used inside AppealFormProvider');
  return state;
}
