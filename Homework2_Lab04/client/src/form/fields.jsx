import { useId } from 'react';
import { useAppealForm } from './AppealFormContext.js';
import styles from './fields.module.css';

/** Phần chung của mọi field: lỗi hiện kèm id để aria-describedby trỏ tới. */
function useField(name) {
  const id = useId();
  const form = useAppealForm();
  const error = form.visibleErrors[name];
  return { id, errorId: `${id}-error`, error, ...form };
}

function FieldError({ id, error }) {
  if (!error) return null;
  return (
    <p id={id} className={styles.error}>
      {error}
    </p>
  );
}

/** @param {{ name: 'email'|'evidenceUrl', label: string, hint?: string } & import('react').InputHTMLAttributes<HTMLInputElement>} props */
export function TextField({ name, label, hint, ...inputProps }) {
  const { id, errorId, error, values, disabled, setValue, touch } = useField(name);
  const hintId = `${id}-hint`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      <input
        {...inputProps}
        id={id}
        name={name}
        value={values[name]}
        disabled={disabled}
        onChange={(e) => setValue(name, e.target.value)}
        onBlur={() => touch(name)}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={styles.input}
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

/** @param {{ name: 'statement', label: string, maxLength: number }} props */
export function TextArea({ name, label, maxLength }) {
  const { id, errorId, error, values, disabled, setValue, touch } = useField(name);
  const countId = `${id}-count`;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={name}
        rows={6}
        value={values[name]}
        disabled={disabled}
        onChange={(e) => setValue(name, e.target.value)}
        onBlur={() => touch(name)}
        aria-invalid={Boolean(error)}
        aria-describedby={[countId, error && errorId].filter(Boolean).join(' ')}
        className={styles.input}
      />
      <span id={countId} className={styles.hint}>
        {values[name].trim().length}/{maxLength} ký tự
      </span>
      <FieldError id={errorId} error={error} />
    </div>
  );
}

/**
 * Nhóm checkbox nhiều lựa chọn. Các checkbox cùng name nên form.elements.namedItem trả RadioNodeList.
 * @param {{ name: 'grounds', legend: string, options: Readonly<Record<string, string>> }} props
 */
export function CheckboxGroup({ name, legend, options }) {
  const { errorId, error, values, disabled, setValue, touch } = useField(name);
  const selected = values[name];
  const toggle = (key, checked) =>
    // Giữ thứ tự theo options, không theo thứ tự bấm.
    setValue(name, Object.keys(options).filter((k) => (k === key ? checked : selected.includes(k))));

  return (
    <fieldset
      className={styles.group}
      onBlur={(e) => {
        // Chỉ tính là đã chạm khi focus rời khỏi cả nhóm.
        if (!e.currentTarget.contains(e.relatedTarget)) touch(name);
      }}
    >
      <legend>{legend}</legend>
      {Object.entries(options).map(([key, text]) => (
        <label key={key} className={styles.check}>
          <input
            type="checkbox"
            name={name}
            value={key}
            checked={selected.includes(key)}
            disabled={disabled}
            onChange={(e) => toggle(key, e.target.checked)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          />
          {text}
        </label>
      ))}
      <FieldError id={errorId} error={error} />
    </fieldset>
  );
}

/** @param {{ name: 'confirm', label: string }} props */
export function Checkbox({ name, label }) {
  const { errorId, error, values, disabled, setValue, touch } = useField(name);
  return (
    <div className={styles.field}>
      <label className={styles.check}>
        <input
          type="checkbox"
          name={name}
          checked={values[name]}
          disabled={disabled}
          onChange={(e) => setValue(name, e.target.checked)}
          onBlur={() => touch(name)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        {label}
      </label>
      <FieldError id={errorId} error={error} />
    </div>
  );
}
