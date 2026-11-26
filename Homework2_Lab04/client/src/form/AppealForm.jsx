import { useId, useRef, useState } from 'react';
import { FIELD_ORDER, GROUNDS, STATEMENT_MAX, toAppeal } from '../../../shared/appealRules.js';
import { ApiError, submitAppeal } from '../api/appealApi.js';
import { describeError } from '../hooks/useDossier.js';
import { useAppealForm } from './AppealFormContext.js';
import { AppealFormProvider } from './AppealFormProvider.jsx';
import { Checkbox, CheckboxGroup, TextArea, TextField } from './fields.jsx';
import styles from './AppealForm.module.css';

/** Đưa focus tới phần tử của field; nhóm checkbox (RadioNodeList) thì tới ô đầu tiên. */
function focusField(form, name) {
  const el = form.elements.namedItem(name);
  const target = el instanceof RadioNodeList ? el[0] : el;
  target?.focus();
}

/** @param {{ playerId: string, onSubmitted: (appeal: object) => void, onAlreadySubmitted: () => void }} props */
function AppealFormBody({ playerId, onSubmitted, onAlreadySubmitted }) {
  const titleId = useId();
  const { values, errors, isValid, submitted, disabled, markSubmitted, setServerErrors } = useAppealForm();
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState(null);
  // Chặn bấm đúp trước khi React kịp render nút disabled.
  const sendingRef = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (disabled || sendingRef.current) return;
    const form = event.currentTarget;
    if (!isValid) {
      markSubmitted();
      focusField(form, FIELD_ORDER.find((f) => f in errors));
      return;
    }
    sendingRef.current = true;
    setSending(true);
    setServerError(null);
    try {
      onSubmitted(await submitAppeal(playerId, toAppeal(values)));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.message === 'Appeal already submitted') {
        // Đơn đã được nộp ở nơi khác (tab khác): tải lại hồ sơ để hiện biên nhận thật.
        onAlreadySubmitted();
      } else if (err instanceof ApiError && err.fields) {
        markSubmitted();
        setServerErrors(err.fields);
        focusField(form, FIELD_ORDER.find((f) => f in err.fields));
      } else {
        setServerError(describeError(err));
      }
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  return (
    <form aria-labelledby={titleId} noValidate onSubmit={handleSubmit} className={styles.form}>
      <h4 id={titleId} className={styles.title}>
        Đơn kháng cáo
      </h4>
      <TextField name="email" label="Email liên hệ" type="email" autoComplete="email" />
      <CheckboxGroup name="grounds" legend="Căn cứ kháng cáo (chọn ít nhất một)" options={GROUNDS} />
      <TextArea name="statement" label="Bản giải trình" maxLength={STATEMENT_MAX} />
      <TextField
        name="evidenceUrl"
        label="Link bằng chứng (không bắt buộc)"
        hint="URL https, ví dụ video hoặc bài báo"
        type="url"
        inputMode="url"
        autoComplete="off"
      />
      <Checkbox name="confirm" label="Tôi xác nhận thông tin trong đơn là đúng sự thật" />
      {submitted && !isValid && (
        <p className={styles.summary}>Đơn còn lỗi, hãy sửa các ô được đánh dấu.</p>
      )}
      {serverError && (
        <p role="alert" className={styles.alert}>
          {serverError}
        </p>
      )}
      <button type="submit" className={styles.submit} disabled={disabled || sending}>
        Nộp đơn kháng cáo
      </button>
      {sending && <p role="status">Đang gửi đơn…</p>}
    </form>
  );
}

/**
 * Form kháng cáo: state dùng chung qua Context, validate real-time bằng luật chung với server.
 * @param {{ playerId: string, disabled: boolean, onSubmitted: (appeal: object) => void, onAlreadySubmitted?: () => void }} props
 */
export function AppealForm({ playerId, disabled, onSubmitted, onAlreadySubmitted = () => {} }) {
  return (
    <AppealFormProvider disabled={disabled}>
      <AppealFormBody playerId={playerId} onSubmitted={onSubmitted} onAlreadySubmitted={onAlreadySubmitted} />
    </AppealFormProvider>
  );
}
