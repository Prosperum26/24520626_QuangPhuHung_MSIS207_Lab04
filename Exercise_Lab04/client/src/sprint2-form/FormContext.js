import { createContext, useContext } from 'react';

/**
 * @typedef {Object} FormState
 * @property {import('./rules.js').Values} values
 * @property {import('./rules.js').Errors} errors         mọi lỗi hiện có (tính trong render)
 * @property {import('./rules.js').Errors} visibleErrors  chỉ lỗi của field đã blur, hoặc tất cả sau khi gửi
 * @property {boolean} isValid
 * @property {boolean} submitted
 * @property {(field: string, value: string) => void} setValue
 * @property {(field: string) => void} touch
 * @property {() => void} markSubmitted
 */

/** @type {import('react').Context<FormState | null>} */
export const FormContext = createContext(null);

/** @returns {FormState} */
export function useFormContext() {
  const state = useContext(FormContext);
  if (!state) throw new Error('useFormContext phải được dùng bên trong <FormProvider>');
  return state;
}
