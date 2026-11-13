import { useId } from 'react';
import { useFormContext } from './FormContext.js';
import styles from './InputField.module.css';

/**
 * Một ô nhập gắn với form qua context. Mỗi ô tự gọi useId() nên id luôn khác nhau
 * (nếu dùng chung một id từ Provider, mọi ô sẽ trùng id).
 * Các prop còn lại (type, inputMode, autoComplete...) chuyển xuống <input>;
 * đặt TRƯỚC các prop do form quản lý để chúng không bị ghi đè.
 * @param {{ name: keyof import('./rules.js').Values, label: string } & import('react').InputHTMLAttributes<HTMLInputElement>} props
 */
export function InputField({ name, label, ...inputProps }) {
  const id = useId();
  const errorId = `${id}-error`;
  const { values, visibleErrors, setValue, touch } = useFormContext();
  const error = visibleErrors[name];

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        {...inputProps}
        id={id}
        name={name}
        value={values[name]}
        onChange={(event) => setValue(name, event.target.value)}
        onBlur={() => touch(name)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={styles.input}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
