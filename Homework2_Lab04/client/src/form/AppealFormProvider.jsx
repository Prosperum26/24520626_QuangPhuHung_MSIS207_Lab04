import { useState } from 'react';
import { INITIAL_VALUES, RULES, evaluateErrors } from '../../../shared/appealRules.js';
import { AppealFormContext } from './AppealFormContext.js';

/**
 * Giữ state độc lập (values, touched, submitted, serverErrors) và TÍNH errors ngay trong render:
 * không effect, nên mỗi phím gõ chỉ một lượt render và lỗi cập nhật real-time.
 * Luật lấy từ shared/appealRules.js, cùng bộ luật server dùng để kiểm lại.
 * @param {{ disabled?: boolean, children: import('react').ReactNode }} props
 */
export function AppealFormProvider({ disabled = false, children }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  // Dẫn xuất trong render.
  const errors = evaluateErrors(values, RULES);
  const isValid = Object.keys(errors).length === 0;
  const clientVisible = submitted ? errors : Object.fromEntries(Object.entries(errors).filter(([f]) => touched[f]));
  const visibleErrors = { ...serverErrors, ...clientVisible };

  const setValue = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Người dùng đã sửa ô này: lỗi server cũ của ô không còn đúng nữa.
    setServerErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };
  const touch = (field) => setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  const markSubmitted = () => setSubmitted(true);

  return (
    <AppealFormContext.Provider
      value={{ values, errors, visibleErrors, isValid, submitted, disabled, setValue, touch, markSubmitted, setServerErrors }}
    >
      {children}
    </AppealFormContext.Provider>
  );
}
