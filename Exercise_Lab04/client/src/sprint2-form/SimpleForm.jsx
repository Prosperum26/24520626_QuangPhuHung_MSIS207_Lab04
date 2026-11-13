import { useId } from 'react';
import { FormProvider } from './FormProvider.jsx';
import { InputField } from './InputField.jsx';
import styles from './SimpleForm.module.css';

/** Form "Thêm người". Gửi form và ShowData xử lý ở S2-09 và S2-10. */
export default function SimpleForm() {
  const headingId = useId();

  return (
    <FormProvider>
      <section className={styles.panel}>
        <h2 id={headingId}>Thêm người</h2>
        <form aria-labelledby={headingId} noValidate onSubmit={(event) => event.preventDefault()}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Thông tin người mới</legend>
            <InputField name="name" label="Họ tên" autoComplete="name" />
            <InputField name="email" label="Email" type="email" autoComplete="email" />
            {/* type="text" + inputMode: type="number" biến chuỗi sai thành '' nên luật "phải là số" không thấy. */}
            <InputField name="age" label="Tuổi" type="text" inputMode="numeric" autoComplete="off" />
            <InputField name="iq" label="IQ" type="text" inputMode="decimal" autoComplete="off" />
            <button type="submit" className={styles.submit}>
              Thêm người
            </button>
          </fieldset>
        </form>
      </section>
    </FormProvider>
  );
}
