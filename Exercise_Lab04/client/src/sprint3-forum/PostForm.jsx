import { useId, useState } from 'react';
import { validatePost } from './postValidation.js';
import styles from './PostForm.module.css';

/**
 * Form gửi tin. Lỗi được TÍNH trong render và chỉ hiện sau lần bấm gửi đầu tiên.
 * @param {{ onPost: (payload: { author: string, text: string }) => Promise<void> }} props
 */
export default function PostForm({ onPost }) {
  const authorId = useId();
  const textId = useId();
  const [values, setValues] = useState({ author: '', text: '' });
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const errors = validatePost(values);
  const shown = attempted ? errors : {};

  const setField = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setAttempted(true);
    const [firstInvalid] = Object.keys(errors);
    if (firstInvalid) {
      event.currentTarget.elements.namedItem(firstInvalid)?.focus();
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      await onPost({ author: values.author.trim(), text: values.text.trim() });
      setValues((prev) => ({ ...prev, text: '' })); // giữ tên để gửi tiếp
      setAttempted(false);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form aria-label="Gửi tin nhắn" noValidate onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor={authorId}>Tên</label>
        <input
          id={authorId}
          name="author"
          value={values.author}
          onChange={setField('author')}
          autoComplete="nickname"
          aria-invalid={Boolean(shown.author)}
          aria-describedby={shown.author ? `${authorId}-error` : undefined}
          className={styles.control}
        />
        {shown.author && (
          <p id={`${authorId}-error`} className={styles.error}>
            {shown.author}
          </p>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor={textId}>Nội dung</label>
        <textarea
          id={textId}
          name="text"
          rows={3}
          value={values.text}
          onChange={setField('text')}
          aria-invalid={Boolean(shown.text)}
          aria-describedby={shown.text ? `${textId}-error` : undefined}
          className={styles.control}
        />
        {shown.text && (
          <p id={`${textId}-error`} className={styles.error}>
            {shown.text}
          </p>
        )}
      </div>
      {serverError && (
        <p role="alert" className={styles.summary}>
          Không gửi được: {serverError}
        </p>
      )}
      <button type="submit" disabled={submitting} className={styles.submit}>
        {submitting ? 'Đang gửi…' : 'Gửi tin nhắn'}
      </button>
    </form>
  );
}
