import { useState } from 'react';
import { FormContext } from './FormContext.js';
import { INITIAL_VALUES, RULES, evaluateErrors } from './rules.js';

/**
 * Giữ state độc lập (values, touched, submitted) và TÍNH errors ngay trong render:
 * không effect, không state phụ cho errors, nên mỗi phím gõ chỉ có một lượt render.
 * @param {{ rules?: typeof RULES, initialValues?: typeof INITIAL_VALUES, children: import('react').ReactNode }} props
 */
export function FormProvider({ rules = RULES, initialValues = INITIAL_VALUES, children }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Dẫn xuất trong render pass.
  const errors = evaluateErrors(values, rules);
  const isValid = Object.keys(errors).length === 0;
  const visibleErrors = submitted
    ? errors
    : Object.fromEntries(Object.entries(errors).filter(([field]) => touched[field]));

  const setValue = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));
  const touch = (field) => setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  const markSubmitted = () => setSubmitted(true);

  return (
    <FormContext.Provider value={{ values, errors, visibleErrors, isValid, submitted, setValue, touch, markSubmitted }}>
      {children}
    </FormContext.Provider>
  );
}
