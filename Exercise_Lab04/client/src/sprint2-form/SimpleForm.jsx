import { useId } from 'react';
import { FormProvider } from './FormProvider.jsx';
import styles from './SimpleForm.module.css';

/** Form "Thêm người". Các ô nhập thêm ở S2-06; gửi form xử lý ở S2-09. */
export default function SimpleForm() {
  const headingId = useId();

  return (
    <FormProvider>
      <section className={styles.panel}>
        <h2 id={headingId}>Thêm người</h2>
        <form aria-labelledby={headingId} noValidate onSubmit={(event) => event.preventDefault()}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Thông tin người mới</legend>
            <button type="submit" className={styles.submit}>
              Thêm người
            </button>
          </fieldset>
        </form>
      </section>
    </FormProvider>
  );
}
