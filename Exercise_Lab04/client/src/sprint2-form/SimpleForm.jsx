import { useId, useState } from 'react';
import { useFormContext } from './FormContext.js';
import { FormProvider } from './FormProvider.jsx';
import { InputField } from './InputField.jsx';
import { toPerson } from './rules.js';
import { ShowData } from './ShowData.jsx';
import styles from './SimpleForm.module.css';

function AddPersonForm() {
  const headingId = useId();
  const resultHeadingId = useId();
  const { values, errors, isValid, submitted, markSubmitted } = useFormContext();
  // Bản ghi của lần gửi hợp lệ gần nhất; null khi chưa gửi hoặc lần gửi gần nhất bị lỗi.
  const [submittedPerson, setSubmittedPerson] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    if (!isValid) {
      markSubmitted();
      setSubmittedPerson(null);
      // Đưa focus tới ô lỗi đầu tiên; trình đọc màn hình đọc luôn lỗi qua aria-describedby.
      const [firstInvalid] = Object.keys(errors);
      event.currentTarget.elements.namedItem(firstInvalid)?.focus();
      return;
    }
    setSubmittedPerson(toPerson(values));
  }

  return (
    <section className={styles.panel}>
      <h2 id={headingId}>Thêm người</h2>
      <form aria-labelledby={headingId} noValidate onSubmit={handleSubmit}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Thông tin người mới</legend>
          <InputField name="name" label="Họ tên" autoComplete="name" />
          <InputField name="email" label="Email" type="email" autoComplete="email" />
          {/* type="text" + inputMode: type="number" biến chuỗi sai thành '' nên luật "phải là số" không thấy. */}
          <InputField name="age" label="Tuổi" type="text" inputMode="numeric" autoComplete="off" />
          <InputField name="iq" label="IQ" type="text" inputMode="decimal" autoComplete="off" />
          {/* Dẫn xuất từ state, không effect: hiện khi đã bấm gửi mà còn lỗi, tự mất khi sửa xong. */}
          {submitted && !isValid && (
            <p role="alert" className={styles.summary}>
              Form còn lỗi, hãy sửa các ô được đánh dấu.
            </p>
          )}
          <button type="submit" className={styles.submit}>
            Thêm người
          </button>
        </fieldset>
      </form>
      {submittedPerson && (
        <section aria-labelledby={resultHeadingId} className={styles.result}>
          <h3 id={resultHeadingId}>Dữ liệu đã gửi</h3>
          <ShowData data={submittedPerson} />
        </section>
      )}
    </section>
  );
}

/** Form "Thêm người": FormProvider giữ state, AddPersonForm đọc qua context. */
export default function SimpleForm() {
  return (
    <FormProvider>
      <AddPersonForm />
    </FormProvider>
  );
}
